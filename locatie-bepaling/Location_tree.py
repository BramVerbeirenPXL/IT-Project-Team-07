import cv2
import json
import datetime
import math
import numpy as np

# Define stereo vision parameters
B = 0.155  # Baseline distance between the cameras, in meters
x0 = 1920  # Image plane coordinate for the point of interest, in pixels
theta_0 = 104  # Angle of view, in degrees
f_x = 583.6522610865065  # Focal length in x (pixels)
image_width = 1920       # Image width in pixels

# Convert theta_0 from degrees to radians
theta_0_rad = math.radians(theta_0)

# Placeholder for pixel values
x1, x2 = None, None
left_img_original, right_img_original = None, None

def get_frame_count(video_file):
    """Get the total number of frames in a video file."""
    cap = cv2.VideoCapture(video_file)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.release()
    return total_frames

def choose_frame(total_frames):
    """Prompt the user to select a valid frame number."""
    print(f"Total frames available: {total_frames}")
    frame_number = int(input(f"Enter the frame number (0 to {total_frames - 1}): "))
    if 0 <= frame_number < total_frames:
        return frame_number
    else:
        print("Invalid frame number. Please try again.")
        return choose_frame(total_frames)

def get_timestamp_from_text_file(txt_file, frame_number):
    """Retrieve the timestamp for the specified frame number from the text file."""
    with open(txt_file, 'r') as file:
        timestamps = file.readlines()
        timestamps = [line.strip() for line in timestamps if line.strip()]
        if 0 <= frame_number < len(timestamps):
            return timestamps[frame_number]
        else:
            raise IndexError("Frame number out of range or invalid timestamps format.")

def find_closest_log_entry(log_file, target_timestamp):
    """Find the closest log entry to the target timestamp."""
    target_time = datetime.datetime.fromisoformat(target_timestamp) - datetime.timedelta(hours=1)
    closest_entry = None
    closest_time_diff = None
    with open(log_file, 'r') as file:
        for line in file:
            log_timestamp_str = line.split(' - ')[0].split(':: ')[-1]
            log_time = datetime.datetime.strptime(log_timestamp_str, '%Y-%m-%d %H:%M:%S,%f')
            time_diff = abs((log_time - target_time).total_seconds())
            if closest_time_diff is None or time_diff < closest_time_diff:
                closest_time_diff = time_diff
                closest_entry = line
    return closest_entry

def extract_latitude_longitude_heading(log_entry):
    """Extract latitude, longitude, and heading from a log entry."""
    latitude = None
    longitude = None
    heading = None
    parts = log_entry.split('-')
    for part in parts:
        if 'Latitude:' in part:
            latitude = part.split('Latitude:')[1].strip().split()[0]
        if 'Longitude:' in part:
            longitude = part.split('Longitude:')[1].strip().split()[0]
        if 'Heading:' in part:
            heading = part.split('Heading:')[1].strip().split()[0]
    return latitude, longitude, float(heading)

def calculate_distance(x1, x2):
    """Calculate the distance based on stereo vision."""
    D = (B * x0) / (2 * math.tan(theta_0_rad / 2) * abs(x1 - x2))
    print(f"Distance to the object: {D:.2f} meters")
    return D

def calculate_object_position(latitude, longitude, heading, distance, x1, x2, image_width, fov):
    """Calculate object's latitude and longitude based on heading, distance, and camera FOV."""
    # Earth's radius in meters
    R = 6371000  
    
    # Convert heading to radians
    heading_rad = math.radians(float(heading))
    
    # Calculate image center and disparity-based angular offset
    x_center = image_width / 2
    offset_x = (x1 + x2) / 2 - x_center
    offset_angle = offset_x * (fov / image_width)  # Offset angle in degrees
    
    # Adjust heading with camera offset
    object_bearing = (heading + offset_angle) % 360  # Normalize to [0, 360)
    object_bearing_rad = math.radians(object_bearing)
    
    # Convert latitude and longitude to radians
    lat1 = math.radians(float(latitude))
    lon1 = math.radians(float(longitude))
    
    # Calculate object's latitude and longitude using spherical trigonometry
    lat2 = math.asin(math.sin(lat1) * math.cos(distance / R) +
                     math.cos(lat1) * math.sin(distance / R) * math.cos(object_bearing_rad))
    lon2 = lon1 + math.atan2(math.sin(object_bearing_rad) * math.sin(distance / R) * math.cos(lat1),
                             math.cos(distance / R) - math.sin(lat1) * math.sin(lat2))
    
    # Convert results back to degrees
    lat2 = math.degrees(lat2)
    lon2 = math.degrees(lon2)
    
    return lat2, lon2

def select_point(event, x, y, flags, param):
    """Mouse callback function to capture clicks on the images."""
    global x1, x2, left_img, right_img
    if event == cv2.EVENT_LBUTTONDOWN:
        if param == 'left':
            x1 = x
            print(f"Selected point on left image: X1 = {x}")
            cv2.circle(left_img, (x, y), 1, (0, 0, 255), -1)
        elif param == 'right':
            x2 = x
            print(f"Selected point on right image: X2 = {x}")
            cv2.circle(right_img, (x, y), 1, (0, 0, 255), -1)

def main():
    """Main function to coordinate the execution of the script."""
    left_video = 'dataverzameling/left.mp4'
    right_video = 'dataverzameling/right.mp4'
    json_file = 'dataverzameling/timestamps.txt'
    log_file = 'dataverzameling/debug_output.log'
    
    total_frames_left = get_frame_count(left_video)
    total_frames_right = get_frame_count(right_video)
    
    # Ensure both videos have the same number of frames
    if total_frames_left != total_frames_right:
        print("Error: Left and right videos have a different number of frames.")
        return
    
    total_frames = total_frames_left
    frame_number = choose_frame(total_frames)
    
    try:
        target_timestamp = get_timestamp_from_text_file(json_file, frame_number)
        if target_timestamp:
            closest_log_entry = find_closest_log_entry(log_file, target_timestamp)
            if closest_log_entry:
                latitude, longitude, heading = extract_latitude_longitude_heading(closest_log_entry)
                print(f"Latitude: {latitude}, Longitude: {longitude}, Heading: {heading}")
                
                cap_left = cv2.VideoCapture(left_video)
                cap_right = cv2.VideoCapture(right_video)
                cap_left.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
                cap_right.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
                
                ret_left, left_img_original = cap_left.read()
                ret_right, right_img_original = cap_right.read()
                
                if ret_left and ret_right:
                    global left_img, right_img
                    left_img = left_img_original.copy()
                    right_img = right_img_original.copy()
                    
                    cv2.namedWindow("Left Image")
                    cv2.setMouseCallback("Left Image", select_point, 'left')
                    cv2.namedWindow("Right Image")
                    cv2.setMouseCallback("Right Image", select_point, 'right')
                    
                    while True:
                        cv2.imshow("Left Image", left_img)
                        cv2.imshow("Right Image", right_img)
                        key = cv2.waitKey(1)
                        
                        if key == 32 and x1 is not None and x2 is not None:
                            cv2.destroyAllWindows()
                            distance = calculate_distance(x1, x2)
                            obj_lat, obj_lon = calculate_object_position(latitude, longitude, heading, distance, x1, x2, 1920, 117.40)
                            print(f"Object position - Latitude: {obj_lat:.6f}, Longitude: {obj_lon:.6f}")
                            break
                        
                        elif key == 27:
                            cv2.destroyAllWindows()
                            break
                else:
                    print("Error: Could not retrieve frames from the video.")
                    cap_left.release()
                    cap_right.release()
                    return
                
                cap_left.release()
                cap_right.release()
            else:
                print("No log entry found close to the timestamp.")
        else:
            print("No timestamp found for the selected frame.")
    except (IndexError, FileNotFoundError) as e:
        print(f"Error: {str(e)}")

if __name__ == '__main__':
    main()






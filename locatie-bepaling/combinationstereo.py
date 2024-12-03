import cv2
import json
import datetime

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
    
    # Ensure timestamps are trimmed and valid
    timestamps = [line.strip() for line in timestamps if line.strip()]
    
    # Return the corresponding timestamp for the given frame number
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
    
    # Split the log entry by '-'
    parts = log_entry.split('-')
    
    for part in parts:
        if 'Latitude:' in part:
            latitude = part.split('Latitude:')[1].strip().split()[0]
        if 'Longitude:' in part:
            longitude = part.split('Longitude:')[1].strip().split()[0]
        if 'Heading:' in part:
            heading = part.split('Heading:')[1].strip().split()[0]
    
    return latitude, longitude, heading

def display_frame(video_file, frame_number, window_name):
    """Display a specific frame from a video file."""
    cap = cv2.VideoCapture(video_file)
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
    ret, frame = cap.read()
    if ret:
        cv2.imshow(window_name, frame)
    else:
        print(f"Could not retrieve frame {frame_number} from {video_file}.")
    cap.release()

def main():
    """Main function to coordinate the execution of the script."""
    left_video = 'dataverzameling/left.mp4'  
    right_video = 'dataverzameling/right.mp4'  
    json_file = 'dataverzameling/timestamps.txt'  
    log_file = 'dataverzameling/debug_output.log' 
    
    # Check frame count for both videos
    total_frames_left = get_frame_count(left_video)
    total_frames_right = get_frame_count(right_video)

    # Ensure both videos have the same number of frames
    if total_frames_left != total_frames_right:
        print("Error: Left and right videos have a different number of frames.")
        return
    
    total_frames = total_frames_left  # Both videos should have the same frame count
    frame_number = choose_frame(total_frames)
    
    try:
        # Get timestamp for the chosen frame
        target_timestamp = get_timestamp_from_text_file(json_file, frame_number)
        
        if target_timestamp:
            # Find the closest log entry to the timestamp
            closest_log_entry = find_closest_log_entry(log_file, target_timestamp)
            if closest_log_entry:
                latitude, longitude, heading = extract_latitude_longitude_heading(closest_log_entry)
                print(f"Latitude: {latitude}, Longitude: {longitude}, Heading: {heading}")
                
                # Display the chosen frame from both videos
                display_frame(left_video, frame_number, "Left Frame")
                display_frame(right_video, frame_number, "Right Frame")
                print("Press any key to close the frame windows.")
                cv2.waitKey(0)
                cv2.destroyAllWindows()
            else:
                print("No log entry found close to the timestamp.")
        else:
            print("No timestamp found for the selected frame.")
    except (IndexError, FileNotFoundError) as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()



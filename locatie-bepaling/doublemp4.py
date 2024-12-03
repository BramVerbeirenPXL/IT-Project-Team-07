import cv2
import numpy as np
import time
from datetime import datetime

# Camera parameters
DIM_LEFT = (1920, 1080)
K_LEFT = np.array([[583.6522610865065, 0.0, 959.8892429068345], 
                   [0.0, 582.5733148926981, 565.2191009777198], 
                   [0.0, 0.0, 1.0]])
D_LEFT = np.array([[0.42099372700109494], [-0.18126947160646645], [-0.02234830763325424], [0.03199801583650251]])

DIM_RIGHT = (1920, 1080)
K_RIGHT = np.array([[583.6522610865065, 0.0, 959.8892429068345], 
                    [0.0, 582.5733148926981, 565.2191009777198], 
                    [0.0, 0.0, 1.0]])
D_RIGHT = np.array([[0.42099372700109494], [-0.18126947160646645], [-0.02234830763325424], [0.03199801583650251]])

# Open webcams
cap_left = cv2.VideoCapture(1)
cap_right = cv2.VideoCapture(0)

# Set resolution
desired_width = 1920
desired_height = 1080
cap_left.set(cv2.CAP_PROP_FRAME_WIDTH, desired_width)
cap_left.set(cv2.CAP_PROP_FRAME_HEIGHT, desired_height)
cap_right.set(cv2.CAP_PROP_FRAME_WIDTH, desired_width)
cap_right.set(cv2.CAP_PROP_FRAME_HEIGHT, desired_height)

# Video writer setup (initialized after starting the recording)
fps = 10  # Desired FPS
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out_left = None
out_right = None

# Timestamp logging setup (opened after recording starts)
timestamp_file = None

def undistort_and_record():
    global out_left, out_right, timestamp_file
    
    if not cap_left.isOpened() or not cap_right.isOpened():
        print("Error: Could not open one or both webcams.")
        return

    print("Press 'spacebar' to start recording. Press 'q' to stop recording.")
    recording = False
    
    while True:
        # Capture frames
        ret_left, frame_left = cap_left.read()
        ret_right, frame_right = cap_right.read()
        
        if not ret_left or not ret_right:
            print("Error: Failed to capture frames.")
            break

        # Undistort frames
        map1_left, map2_left = cv2.fisheye.initUndistortRectifyMap(K_LEFT, D_LEFT, np.eye(3), K_LEFT, DIM_LEFT, cv2.CV_16SC2)
        undistorted_frame_left = cv2.remap(frame_left, map1_left, map2_left, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)

        map1_right, map2_right = cv2.fisheye.initUndistortRectifyMap(K_RIGHT, D_RIGHT, np.eye(3), K_RIGHT, DIM_RIGHT, cv2.CV_16SC2)
        undistorted_frame_right = cv2.remap(frame_right, map1_right, map2_right, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)

        # Show live camera feeds
        cv2.imshow('Left Camera', undistorted_frame_left)
        cv2.imshow('Right Camera', undistorted_frame_right)

        # Start recording on spacebar press
        key = cv2.waitKey(1) & 0xFF
        if key == ord(' '):  # Spacebar pressed
            if not recording:
                # Initialize video writers and timestamp log
                out_left = cv2.VideoWriter('left.mp4', fourcc, fps, (desired_width, desired_height))
                out_right = cv2.VideoWriter('right.mp4', fourcc, fps, (desired_width, desired_height))
                timestamp_file = open('timestamps.txt', 'w')
                recording = True
                print("Recording started.")

        # Stop recording on 'q' press
        if key == ord('q'):  # Quit
            if recording:
                print("Recording stopped.")
            break

        # Write frames and log timestamps if recording
        if recording:
            out_left.write(undistorted_frame_left)
            out_right.write(undistorted_frame_right)

            # Log absolute timestamps in readable format
            current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')
            timestamp_file.write(f"{current_time}\n")

    # Release resources
    cap_left.release()
    cap_right.release()
    if out_left: out_left.release()
    if out_right: out_right.release()
    if timestamp_file: timestamp_file.close()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    undistort_and_record()


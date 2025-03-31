# Projectile Motion Simulator Readme

## Overview
This project is a WebGL-based projectile motion simulator that allows users to visualize and analyze the trajectory of a projectile. The application provides a graphical representation of a cannon firing a projectile, with customizable initial velocity and angle.

## Files
- **projectile_motion.html**: The HTML file that creates the user interface, including the WebGL canvas and control elements.
- **projectile_motion.js**: The JavaScript file that implements the physics simulation, WebGL rendering, and animation logic.
- **webgl-utils.js**: Utility functions for WebGL (not included, but referenced).
- **initShaders.js**: Functions for initializing WebGL shaders (not included, but referenced).
- **MV.js**: Matrix/Vector library for WebGL operations (not included, but referenced).

## Features
- Interactive simulation of projectile motion with customizable parameters
- Real-time visualization of a projectile's trajectory
- Adjustable launch angle (0-90 degrees)
- Adjustable initial velocity (0-50 m/s)
- Real-time calculation and display of:
  - Maximum height reached
  - Maximum horizontal distance traveled
  - Total flight time

## Usage
1. Open the HTML file in a web browser that supports WebGL.
2. Use the "Proj. Angle" slider to set the launch angle (0-90 degrees).
3. Use the "Initial Speed" slider to set the initial velocity (0-50 m/s).
4. Click the "Start projectile" button to launch the projectile and view the animation.
5. View the calculated physics values (max height, distance, and flight time) displayed in the info fields.

## Physics Implementation
- The simulation uses standard projectile motion equations:
  - Horizontal position: x = vₓ × t
  - Vertical position: y = vᵧ × t - 0.5 × g × t²
  - Maximum height: h = vᵧ² / (2g)
  - Flight time: t = 2 × vᵧ / g
  - Maximum distance: d = vₓ × t
- Where:
  - vₓ = v₀ × cos(θ)
  - vᵧ = v₀ × sin(θ)
  - g = 9.8 m/s² (gravity)

## Technical Details
- The application uses WebGL for rendering graphics
- The cannon and projectile are rendered using simple geometric shapes
- The animation is implemented with JavaScript's setTimeout for consistent timing
- The projectile's motion is calculated based on physics equations for projectile motion
- The simulation uses scaled coordinates to fit the trajectory within the canvas

## Author
Ethan Wight  

import { View } from 'react-native';
import { GLView } from 'expo-gl';

export default function App() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
            <GLView style={{ width: 300, height: 300 }} onContextCreate={onContextCreate} />
        </View>
    );
}

function onContextCreate(gl: any) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    // Vertex shader with rotation
    const vertexShaderSource = `
        attribute vec2 a_position;
        attribute vec3 a_color;
        uniform float u_rotation;
        varying vec3 v_color;
        
        void main() {
            // Apply rotation
            float c = cos(u_rotation);
            float s = sin(u_rotation);
            mat2 rotation = mat2(c, s, -s, c);
            vec2 rotated = rotation * a_position;
            
            gl_Position = vec4(rotated, 0.0, 1.0);
            v_color = a_color;
        }
    `;

    // Fragment shader with color interpolation
    const fragmentShaderSource = `
        precision mediump float;
        varying vec3 v_color;
        
        void main() {
            gl_FragColor = vec4(v_color, 1.0);
        }
    `;

    // Create and compile shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Triangle vertices (x, y, r, g, b)
    const vertices = new Float32Array([
        // Position    // Color (RGB)
        0.0, 0.6,     1.0, 0.0, 0.0,  // Top vertex - Red
        -0.5, -0.6,   0.0, 1.0, 0.0,  // Bottom-left - Green
        0.5, -0.6,    0.0, 0.0, 1.0,  // Bottom-right - Blue
    ]);

    // Create buffer and upload data
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Set up position attribute
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 20, 0);

    // Set up color attribute
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 20, 8);

    // Get rotation uniform location
    const rotationLocation = gl.getUniformLocation(program, 'u_rotation');

    let rotation = 0;

    // Animation loop
    const animate = () => {
        // Update rotation
        rotation += 0.02;

        // Clear canvas with dark background
        gl.clearColor(0.1, 0.1, 0.15, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Set rotation uniform
        gl.uniform1f(rotationLocation, rotation);

        // Draw triangle
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // End frame and schedule next one
        gl.endFrameEXP();
        requestAnimationFrame(animate);
    };

    // Start animation
    animate();
}

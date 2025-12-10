import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import { GLView } from 'expo-gl';

export default function InteractiveGLView() {
    const [rotation, setRotation] = useState(0);
    const [scale, setScale] = useState(1.0);
    const [touchInfo, setTouchInfo] = useState('触摸屏幕来旋转和缩放三角形');
    const glRef = useRef<any>(null);
    const rotationLocationRef = useRef<any>(null);
    const scaleLocationRef = useRef<any>(null);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            
            onPanResponderGrant: (evt) => {
                setTouchInfo(`开始触摸 - 位置: (${Math.round(evt.nativeEvent.locationX)}, ${Math.round(evt.nativeEvent.locationY)})`);
            },
            
            onPanResponderMove: (evt, gestureState) => {
                const newRotation = rotation + gestureState.dx * 0.01;
                setRotation(newRotation);
                
                const newScale = Math.max(0.5, Math.min(2.0, scale - gestureState.dy * 0.002));
                setScale(newScale);
                
                setTouchInfo(`拖动中 - 旋转: ${newRotation.toFixed(2)} | 缩放: ${newScale.toFixed(2)}`);
            },
            
            onPanResponderRelease: (evt, gestureState) => {
                setTouchInfo(`释放 - 速度: (${gestureState.vx.toFixed(2)}, ${gestureState.vy.toFixed(2)})`);
            },
        })
    ).current;

    const onContextCreate = (gl: any) => {
        glRef.current = gl;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec3 a_color;
            uniform float u_rotation;
            uniform float u_scale;
            varying vec3 v_color;
            
            void main() {
                float c = cos(u_rotation);
                float s = sin(u_rotation);
                mat2 rotation = mat2(c, s, -s, c);
                vec2 rotated = rotation * a_position * u_scale;
                gl_Position = vec4(rotated, 0.0, 1.0);
                v_color = a_color;
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            varying vec3 v_color;
            void main() {
                gl_FragColor = vec4(v_color, 1.0);
            }
        `;

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        const vertices = new Float32Array([
            0.0, 0.6,     1.0, 0.2, 0.3,
            -0.5, -0.6,   0.2, 0.8, 0.9,
            0.5, -0.6,    0.9, 0.5, 0.2,
        ]);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 20, 0);

        const colorLocation = gl.getAttribLocation(program, 'a_color');
        gl.enableVertexAttribArray(colorLocation);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 20, 8);

        rotationLocationRef.current = gl.getUniformLocation(program, 'u_rotation');
        scaleLocationRef.current = gl.getUniformLocation(program, 'u_scale');

        render();
    };

    const render = () => {
        const gl = glRef.current;
        if (!gl) return;

        gl.clearColor(0.05, 0.05, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(rotationLocationRef.current, rotation);
        gl.uniform1f(scaleLocationRef.current, scale);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.endFrameEXP();
    };

    React.useEffect(() => {
        if (glRef.current) {
            render();
        }
    }, [rotation, scale]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎮 交互式 WebGL 视图</Text>
            <Text style={styles.instructions}>👆 水平拖动旋转 | 垂直拖动缩放</Text>
            
            <View style={styles.glContainer} {...panResponder.panHandlers}>
                <GLView style={styles.glView} onContextCreate={onContextCreate} />
            </View>
            
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>{touchInfo}</Text>
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>旋转</Text>
                        <Text style={styles.statValue}>{rotation.toFixed(2)}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>缩放</Text>
                        <Text style={styles.statValue}>{scale.toFixed(2)}x</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1a1a1a', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 10 },
    instructions: { fontSize: 16, color: '#aaa', textAlign: 'center', marginBottom: 20 },
    glContainer: { alignSelf: 'center', borderRadius: 12, borderWidth: 2, borderColor: '#444' },
    glView: { width: 320, height: 320 },
    infoContainer: { marginTop: 20, padding: 15, backgroundColor: '#2a2a2a', borderRadius: 8 },
    infoText: { fontSize: 14, color: '#fff', marginBottom: 15 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
    statBox: { alignItems: 'center', backgroundColor: '#333', padding: 10, borderRadius: 6, minWidth: 120 },
    statLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
    statValue: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
});
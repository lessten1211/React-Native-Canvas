import React, { useEffect, useRef, memo } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { Renderer } from 'expo-three';

export default function ThreePet() {
    const requestId = useRef(null);
    const mounted = useRef(true);
    const cubeRef = useRef(null);
    const pendingRot = useRef({ x: 0, y: 0 });
    const needUpdate = useRef(true);

    // 阈值避免抖动
    const MOVE_THRESHOLD = 1.2;

    // 手势层
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,

            onPanResponderMove: (e, g) => {
                const { dx, dy } = g;

                if (Math.abs(dx) < MOVE_THRESHOLD && Math.abs(dy) < MOVE_THRESHOLD) {
                    return;
                }

                pendingRot.current.y += dx * 0.01;
                pendingRot.current.x -= dy * 0.01;

                needUpdate.current = true;
            },
        })
    ).current;

    const onContextCreate = async (gl) => {
        const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

        const renderer = new Renderer({ gl });
        renderer.setSize(width, height);
        renderer.setClearColor(0x1a1a2e);

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
        camera.position.z = 3;

        // 一个环境光就够
        scene.add(new THREE.AmbientLight(0xffffff, 1));

        // 轻量立方体（1x1x1）
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x77aaff });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        cubeRef.current = cube;

        // 轻量渲染循环（仅在需要时渲染）
        const renderLoop = () => {
            if (!mounted.current) return;

            if (needUpdate.current) {
                cube.rotation.x += pendingRot.current.x;
                cube.rotation.y += pendingRot.current.y;

                pendingRot.current.x = 0;
                pendingRot.current.y = 0;

                renderer.render(scene, camera);
                gl.endFrameEXP();

                needUpdate.current = false;
            }

            requestId.current = requestAnimationFrame(renderLoop);
        };

        renderLoop();
    };

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            if (requestId.current) cancelAnimationFrame(requestId.current);
        };
    }, []);

    return (
        <View style={styles.container}>
            <GLView
                pointerEvents="none"
                style={StyleSheet.absoluteFill}
                onContextCreate={onContextCreate}
            />

            {/* 手势层 */}
            <View
                {...panResponder.panHandlers}
                pointerEvents="box-only"
                style={StyleSheet.absoluteFill}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
});

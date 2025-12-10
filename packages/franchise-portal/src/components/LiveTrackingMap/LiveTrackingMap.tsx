/**
 * Live Tracking Map Component
 * 
 * Interactive map for visualizing shipment tracking:
 * - Breadcrumb trail (GPS points connected)
 * - Last known location marker
 * - Replay path feature (jump to event timestamps)
 * - Speed overlay (color-coded by speed)
 * 
 * Note: This is a placeholder implementation using a simple canvas-based map.
 * In production, integrate with Leaflet, Mapbox, or Google Maps.
 */

import React, { useRef, useEffect, useState } from 'react';
import { Card, Button, Space, Slider, Tag, Statistic, Row, Col } from 'antd';
import {
  EnvironmentOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  FastForwardOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

interface GPSPoint {
  lat: number;
  lng: number;
  speed: number;
  timestamp: string;
}

interface LiveTrackingMapProps {
  shipmentId: string;
  gpsPoints: GPSPoint[];
  pickupLocation: { lat: number; lng: number; city: string };
  dropLocation: { lat: number; lng: number; city: string };
  currentLocation?: { lat: number; lng: number };
  theme?: 'light' | 'dark';
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  shipmentId,
  gpsPoints,
  pickupLocation,
  dropLocation,
  currentLocation,
  theme = 'light',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(gpsPoints.length - 1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const isDark = theme === 'dark';
  const bgCard = isDark ? '#151922' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0E14';
  const textSecondary = isDark ? '#B4B9C5' : '#6B7280';
  const border = isDark ? '#2D3748' : '#E5E7EB';

  // Calculate map bounds
  const allLats = [
    pickupLocation.lat,
    dropLocation.lat,
    ...gpsPoints.map((p) => p.lat),
  ];
  const allLngs = [
    pickupLocation.lng,
    dropLocation.lng,
    ...gpsPoints.map((p) => p.lng),
  ];

  const minLat = Math.min(...allLats);
  const maxLat = Math.max(...allLats);
  const minLng = Math.min(...allLngs);
  const maxLng = Math.max(...allLngs);

  // Simple projection (lat/lng to canvas coordinates)
  const project = (lat: number, lng: number, width: number, height: number) => {
    const padding = 40;
    const x =
      padding +
      ((lng - minLng) / (maxLng - minLng)) * (width - 2 * padding);
    const y =
      padding +
      ((maxLat - lat) / (maxLat - minLat)) * (height - 2 * padding);
    return { x, y };
  };

  // Get speed color
  const getSpeedColor = (speed: number) => {
    if (speed < 30) return '#10B981'; // Green (slow)
    if (speed < 60) return '#3B82F6'; // Blue (medium)
    if (speed < 80) return '#F59E0B'; // Orange (fast)
    return '#EF4444'; // Red (very fast)
  };

  // Draw map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = isDark ? '#0A0E14' : '#F3F4F6';
    ctx.fillRect(0, 0, width, height);

    // Draw route line
    if (gpsPoints.length > 1) {
      for (let i = 0; i < currentIndex; i++) {
        const p1 = gpsPoints[i];
        const p2 = gpsPoints[i + 1];

        const { x: x1, y: y1 } = project(p1.lat, p1.lng, width, height);
        const { x: x2, y: y2 } = project(p2.lat, p2.lng, width, height);

        ctx.strokeStyle = getSpeedColor(p1.speed);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    // Draw GPS points
    gpsPoints.slice(0, currentIndex + 1).forEach((point, idx) => {
      const { x, y } = project(point.lat, point.lng, width, height);

      // Small circle for each point
      ctx.fillStyle = getSpeedColor(point.speed);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw pickup marker
    const pickup = project(pickupLocation.lat, pickupLocation.lng, width, height);
    ctx.fillStyle = '#3B82F6';
    ctx.font = '20px Arial';
    ctx.fillText('📍', pickup.x - 10, pickup.y + 7);
    ctx.fillStyle = textPrimary;
    ctx.font = '12px Arial';
    ctx.fillText(pickupLocation.city, pickup.x + 15, pickup.y + 4);

    // Draw drop marker
    const drop = project(dropLocation.lat, dropLocation.lng, width, height);
    ctx.fillStyle = '#EF4444';
    ctx.font = '20px Arial';
    ctx.fillText('🏁', drop.x - 10, drop.y + 7);
    ctx.fillStyle = textPrimary;
    ctx.font = '12px Arial';
    ctx.fillText(dropLocation.city, drop.x + 15, drop.y + 4);

    // Draw current location marker (if different from latest GPS)
    if (currentLocation && currentIndex === gpsPoints.length - 1) {
      const current = project(currentLocation.lat, currentLocation.lng, width, height);
      ctx.fillStyle = '#10B981';
      ctx.font = '24px Arial';
      ctx.fillText('🚚', current.x - 12, current.y + 8);
    }
  }, [gpsPoints, currentIndex, pickupLocation, dropLocation, currentLocation, isDark]);

  // Playback control
  useEffect(() => {
    if (!playing || currentIndex >= gpsPoints.length - 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= gpsPoints.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [playing, currentIndex, gpsPoints.length, playbackSpeed]);

  const currentPoint = gpsPoints[currentIndex];

  return (
    <div>
      {/* Map Canvas */}
      <Card
        style={{ marginBottom: '16px', background: bgCard, border: `1px solid ${border}` }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          style={{
            width: '100%',
            height: 'auto',
            border: `1px solid ${border}`,
            borderRadius: '4px',
          }}
        />
      </Card>

      {/* Current Point Stats */}
      {currentPoint && (
        <Card
          style={{ marginBottom: '16px', background: bgCard, border: `1px solid ${border}` }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Location"
                value={`${currentPoint.lat.toFixed(4)}, ${currentPoint.lng.toFixed(4)}`}
                valueStyle={{ fontSize: '14px', fontFamily: 'monospace' }}
                prefix={<EnvironmentOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Speed"
                value={currentPoint.speed}
                suffix="km/h"
                valueStyle={{ fontSize: '18px', color: getSpeedColor(currentPoint.speed) }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Timestamp"
                value={new Date(currentPoint.timestamp).toLocaleTimeString()}
                valueStyle={{ fontSize: '14px' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Point"
                value={`${currentIndex + 1} / ${gpsPoints.length}`}
                valueStyle={{ fontSize: '14px' }}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Playback Controls */}
      <Card
        title="Playback Controls"
        style={{ background: bgCard, border: `1px solid ${border}` }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space wrap>
            <Button
              type="primary"
              icon={playing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => setPlaying(!playing)}
              disabled={currentIndex >= gpsPoints.length - 1}
            >
              {playing ? 'Pause' : 'Play'}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setCurrentIndex(0);
                setPlaying(false);
              }}
            >
              Reset
            </Button>
            <Button
              icon={<FastForwardOutlined />}
              onClick={() => setCurrentIndex(gpsPoints.length - 1)}
            >
              Jump to Latest
            </Button>
          </Space>

          <div style={{ marginTop: '16px' }}>
            <div style={{ marginBottom: '8px', color: textSecondary }}>
              Playback Speed: {playbackSpeed}x
            </div>
            <Slider
              min={0.5}
              max={4}
              step={0.5}
              value={playbackSpeed}
              onChange={setPlaybackSpeed}
              marks={{
                0.5: '0.5x',
                1: '1x',
                2: '2x',
                4: '4x',
              }}
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{ marginBottom: '8px', color: textSecondary }}>
              Timeline Scrubber
            </div>
            <Slider
              min={0}
              max={gpsPoints.length - 1}
              value={currentIndex}
              onChange={(value) => {
                setCurrentIndex(value);
                setPlaying(false);
              }}
              tooltip={{
                formatter: (value) =>
                  value !== undefined
                    ? new Date(gpsPoints[value].timestamp).toLocaleString()
                    : '',
              }}
            />
          </div>
        </Space>
      </Card>

      {/* Speed Legend */}
      <Card
        title="Speed Legend"
        size="small"
        style={{ marginTop: '16px', background: bgCard, border: `1px solid ${border}` }}
      >
        <Space wrap>
          <Tag color="green">0-30 km/h (Slow)</Tag>
          <Tag color="blue">30-60 km/h (Medium)</Tag>
          <Tag color="orange">60-80 km/h (Fast)</Tag>
          <Tag color="red">80+ km/h (Very Fast)</Tag>
        </Space>
      </Card>
    </div>
  );
};


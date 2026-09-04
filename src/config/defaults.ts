import type { Point } from '../core/types';
import { DEFAULT_PLAN_OPTIONS } from '../core/image/floorPlan';

export const DEFAULT_MAP_URL = '/maps/mapa_robotica.png';
export const DEFAULT_MAP_NAME = 'mapa_robotica.png';
export const DEFAULT_START: Point = { x: 6, y: 6 };
export const DEFAULT_GOAL: Point = { x: 66, y: 50 };
export const DEFAULT_ROBOT_RADIUS = DEFAULT_PLAN_OPTIONS.robotRadius;
export const DEFAULT_CELLS_PER_BLOCK = DEFAULT_PLAN_OPTIONS.cellsPerBlock;
export const PLAN_RESOLUTION = DEFAULT_PLAN_OPTIONS.resolution;
export const MIN_CELL_PX = 3;
export const SPEED_OPTIONS = [15, 60, 240, 1000] as const;

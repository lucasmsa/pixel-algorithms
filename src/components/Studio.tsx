import { useDefaultPlan } from '../hooks/useDefaultPlan';
import { usePlayback } from '../hooks/usePlayback';
import { AlgorithmPicker } from './AlgorithmPicker';
import { CanvasStage } from './CanvasStage';
import { Header } from './Header';
import { ImportPanel } from './ImportPanel';
import { Legend } from './Legend';
import { ParamsPanel } from './ParamsPanel';
import { Readouts } from './Readouts';
import { Scrubber } from './Scrubber';

export function Studio() {
  useDefaultPlan();
  usePlayback();
  return (
    <div className="studio">
      <Header />
      <main className="workbench">
        <div className="stage-column">
          <CanvasStage />
          <Scrubber />
        </div>
        <aside className="panel" aria-label="Controls">
          <AlgorithmPicker />
          <ParamsPanel />
          <ImportPanel />
          <Readouts />
          <Legend />
        </aside>
      </main>
    </div>
  );
}

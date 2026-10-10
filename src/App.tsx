import { TooltipProvider } from '@/components/ui/tooltip';
import { Costing, CostingOld } from './components/Costing';
function App() {
  return (
    <>
      <section id='center'>
        <TooltipProvider>
          <Costing />
        </TooltipProvider>
      </section>
    </>
  );
}

export default App;

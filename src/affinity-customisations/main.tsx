import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AffinityCustomisations } from './AffinityCustomisations';

createRoot(document.getElementById('affinity-customisations')!).render(
  <StrictMode>
    <AffinityCustomisations />
  </StrictMode>,
);

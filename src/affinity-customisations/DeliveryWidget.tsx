import { RescheduleModal } from './RescheduleModal';

function mountWidget() {
  document.addEventListener('Recharge::slot::mounted', (event: Event) => {
    const customEvent = event as CustomEvent<{ name: string; pathname: string }>;
    if (customEvent.detail.name === 'header' && customEvent.detail.pathname === '/overview') {
      // deliveryDateWidgetManager.init();
      console.log('Delivery Date Widget mounted');
    }
  });
}

export function DeliveryWidget() {
  mountWidget();

  return (
    <div id="affinity-delivery-date-section" className="aff-card t-mb3">
      <span className="aff-h3 t-mb2">Delivery Date Widget</span>
      <div id="affinity-delivery-date-widget" className="affinity-delivery-date-widget">
        <div id="charge-date"></div>
        <div id="upcoming-delivery-date"></div>
        <RescheduleModal />
        <button id="skip-next-order">Skip</button>
      </div>
    </div>
  );
}

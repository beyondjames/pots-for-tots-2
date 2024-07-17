if (!customElements.get('upsell-modal')) {
  customElements.define(
    'upsell-modal',
    class UpsellModal extends ModalDialog {
      constructor() {
        super();
      }

      hide() {
        super.hide();
      }

      show(opener) {
        super.show(opener);
        this.showUpsells();
      }

      showUpsells() {
        // Code to display upsells
        console.log('Showing upsells');
        // this.querySelectorAll(
        //   `[data-media-id]:not([data-media-id="${this.openedBy.getAttribute('data-media-id')}"])`
        // ).forEach((element) => {
        //   element.classList.remove('active');
        // });
        // const activeMedia = this.querySelector(`[data-media-id="${this.openedBy.getAttribute('data-media-id')}"]`);
        // const activeMediaTemplate = activeMedia.querySelector('template');
        // const activeMediaContent = activeMediaTemplate ? activeMediaTemplate.content : null;
        // activeMedia.classList.add('active');
        // activeMedia.scrollIntoView();
        // const container = this.querySelector('[role="document"]');
        // container.scrollLeft = (activeMedia.width - container.clientWidth) / 2;
        // if (
        //   activeMedia.nodeName == 'DEFERRED-MEDIA' &&
        //   activeMediaContent &&
        //   activeMediaContent.querySelector('.js-youtube')
        // )
        //   activeMedia.loadContent();
      }
    }
  );
}

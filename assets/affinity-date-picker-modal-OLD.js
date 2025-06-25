class CustomModal extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('custom-modal-template');
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.shadowRoot.querySelector('.custom-modal-close').addEventListener('click', () => this.close());
    this.shadowRoot.querySelector('.custom-modal-overlay').addEventListener('mousedown', (e) => {
      if (e.target === this.shadowRoot.querySelector('.custom-modal-overlay')) {
        this.close();
      }
    });
  }

  open() {
    this.style.display = 'block';
  }

  close() {
    this.style.display = 'none';
    this.remove();
  }
}

customElements.define('custom-modal', CustomModal);

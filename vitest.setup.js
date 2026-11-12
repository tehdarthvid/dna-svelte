// jsdom has HTMLDialogElement but not showModal()/close(); minimal stand-ins
const proto = globalThis.HTMLDialogElement?.prototype;
if (proto && !proto.showModal) {
  proto.showModal = function () {
    this.setAttribute("open", "");
  };
  proto.close = function () {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

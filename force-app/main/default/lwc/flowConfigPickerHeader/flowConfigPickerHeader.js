import { LightningElement, api } from "lwc";

export default class FlowConfigPickerHeader extends LightningElement {
  @api items = [];
  @api locationLabel = "Picker location";
  @api closeLabel = "Close picker";

  handleNavigate(event) {
    this.dispatchEvent(
      new CustomEvent("navigate", {
        bubbles: true,
        composed: true,
        detail: { depth: Number(event.currentTarget.dataset.depth) }
      })
    );
  }

  handleClose() {
    this.dispatchEvent(
      new CustomEvent("close", { bubbles: true, composed: true })
    );
  }
}

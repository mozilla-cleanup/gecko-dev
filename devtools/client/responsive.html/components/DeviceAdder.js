/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-env browser */

"use strict";

const { DOM: dom, createClass, createFactory, PropTypes, addons } =
  require("devtools/client/shared/vendor/react");

const { getFormatStr, getStr } = require("../utils/l10n");
const Types = require("../types");
const ViewportDimension = createFactory(require("./ViewportDimension.js"));

module.exports = createClass({
  displayName: "DeviceAdder",

  propTypes: {
    devices: PropTypes.shape(Types.devices).isRequired,
    viewportTemplate: PropTypes.shape(Types.viewport).isRequired,
    onAddCustomDevice: PropTypes.func.isRequired,
  },

  mixins: [ addons.PureRenderMixin ],

  getInitialState() {
    return {};
  },

  componentWillReceiveProps(nextProps) {
    let {
      width,
      height,
    } = nextProps.viewportTemplate;

    this.setState({
      width,
      height,
    });
  },

  onChangeSize(width, height) {
    this.setState({
      width,
      height,
    });
  },

  onDeviceAdderShow() {
    this.setState({
      deviceAdderDisplayed: true,
    });
  },

  onDeviceAdderSave() {
    let {
      devices,
      onAddCustomDevice,
    } = this.props;

    if (!this.pixelRatioInput.checkValidity()) {
      return;
    }
    if (devices.custom.find(device => device.name == this.nameInput.value)) {
      this.nameInput.setCustomValidity("Device name already in use");
      return;
    }

    this.setState({
      deviceAdderDisplayed: false,
    });
    onAddCustomDevice({
      name: this.nameInput.value,
      width: this.state.width,
      height: this.state.height,
      pixelRatio: parseFloat(this.pixelRatioInput.value),
      userAgent: this.userAgentInput.value,
      touch: this.touchInput.checked,
    });
  },

  render() {
    let {
      devices,
      viewportTemplate,
    } = this.props;

    let {
      deviceAdderDisplayed,
      height,
      width,
    } = this.state;

    if (!deviceAdderDisplayed) {
      return dom.div(
        {
          id: "device-adder"
        },
        dom.button(
          {
            id: "device-adder-show",
            onClick: this.onDeviceAdderShow,
          },
          getStr("responsive.addDevice")
        )
      );
    }

    // If a device is currently selected, fold its attributes into a single object for use
    // as the starting values of the form.  If no device is selected, use the values for
    // the current window.
    let deviceName;
    let normalizedViewport = Object.assign({}, viewportTemplate);
    if (viewportTemplate.device) {
      let device = devices[viewportTemplate.deviceType].find(d => {
        return d.name == viewportTemplate.device;
      });
      deviceName = getFormatStr("responsive.customDeviceNameFromBase", device.name);
      Object.assign(normalizedViewport, {
        pixelRatio: device.pixelRatio,
        userAgent: device.userAgent,
        touch: device.touch,
      });
    } else {
      deviceName = getStr("responsive.customDeviceName");
      Object.assign(normalizedViewport, {
        pixelRatio: window.devicePixelRatio,
        userAgent: navigator.userAgent,
        touch: false,
      });
    }

    return dom.div(
      {
        id: "device-adder"
      },
      dom.div(
        {
          id: "device-adder-content",
        },
        dom.div(
          {
            id: "device-adder-column-1",
          },
          dom.label(
            {
              id: "device-adder-name",
            },
            dom.span(
              {
                className: "device-adder-label",
              },
              getStr("responsive.deviceAdderName")
            ),
            dom.input({
              defaultValue: deviceName,
              ref: input => {
                this.nameInput = input;
              },
            })
          ),
          dom.label(
            {
              id: "device-adder-size",
            },
            dom.span(
              {
                className: "device-adder-label"
              },
              getStr("responsive.deviceAdderSize")
            ),
            ViewportDimension({
              viewport: {
                width,
                height,
              },
              onChangeSize: this.onChangeSize,
              onRemoveDeviceAssociation: () => {},
            })
          ),
          dom.label(
            {
              id: "device-adder-pixel-ratio",
            },
            dom.span(
              {
                className: "device-adder-label"
              },
              getStr("responsive.deviceAdderPixelRatio")
            ),
            dom.input({
              type: "number",
              step: "any",
              defaultValue: normalizedViewport.pixelRatio,
              ref: input => {
                this.pixelRatioInput = input;
              },
            })
          )
        ),
        dom.div(
          {
            id: "device-adder-column-2",
          },
          dom.label(
            {
              id: "device-adder-user-agent",
            },
            dom.span(
              {
                className: "device-adder-label"
              },
              getStr("responsive.deviceAdderUserAgent")
            ),
            dom.input({
              defaultValue: normalizedViewport.userAgent,
              ref: input => {
                this.userAgentInput = input;
              },
            })
          ),
          dom.label(
            {
              id: "device-adder-touch",
            },
            dom.span(
              {
                className: "device-adder-label"
              },
              getStr("responsive.deviceAdderTouch")
            ),
            dom.input({
              defaultChecked: normalizedViewport.touch,
              type: "checkbox",
              ref: input => {
                this.touchInput = input;
              },
            })
          )
        ),
      ),
      dom.button(
        {
          id: "device-adder-save",
          onClick: this.onDeviceAdderSave,
        },
        getStr("responsive.deviceAdderSave")
      )
    );
  },
});

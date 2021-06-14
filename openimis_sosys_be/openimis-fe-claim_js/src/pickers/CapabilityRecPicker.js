import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";
import { CAPABILITY_REC } from "../constants";
class CapabilityRecPicker extends Component {

    render() {
        return  <ConstantBasedPicker
        module="claim"
        label="capability rec"
        constants={CAPABILITY_REC}
        {...this.props}
    />  
    }
}

export default CapabilityRecPicker;
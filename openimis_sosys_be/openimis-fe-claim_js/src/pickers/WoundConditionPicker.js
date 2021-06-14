import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";
import { WOUND_CONDITION } from "../constants";
class WopundConditionPicker extends Component {

    render() {
        return  <ConstantBasedPicker
        module="claim"
        label="Wound Condition"
        constants={WOUND_CONDITION}
        {...this.props}
    />  
    }
}

export default WopundConditionPicker;
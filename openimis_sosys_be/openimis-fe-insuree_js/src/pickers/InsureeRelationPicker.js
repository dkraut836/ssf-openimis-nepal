import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";
import { RELATION } from "../constants";

class InsureeRelationPicker extends Component {

    render() {
        console.log('hit on reducer', this.props)
        return <ConstantBasedPicker
            module="insuree"
            label="relation"
            constants={RELATION}
            {...this.props}
        />
    }
}

export default InsureeRelationPicker;
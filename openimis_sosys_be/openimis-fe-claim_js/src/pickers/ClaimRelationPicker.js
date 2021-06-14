import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";
import { RELATION } from "../constants";

class ClaimRelationPicker extends Component {

    render() {
        return <ConstantBasedPicker
            module="claim"
            label="Relation"
            
            constants={RELATION}
            {...this.props}
            
        />
    }
}

export default ClaimRelationPicker;
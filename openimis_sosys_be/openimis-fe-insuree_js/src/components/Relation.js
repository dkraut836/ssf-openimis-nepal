import React,{Component} from 'react';
import InsureeRelationPicker from "../pickers/InsureeRelationPicker";

class Relation extends Component{
    state={
        spouseId:''
    }

    onSelect=(v)=>{
        console.log('changee', v)
    }

    onChangeRelation=(v)=>{
        if(v==='SP'){
            this.setState({
                spouseId:'S'+ this.props.edited.insuree.chfId
            })
        }
        else{
            this.setState({
                spouseId:this.props.edited.insuree.chfId
            })
        }
    }

    render(){
        console.log('hit relation on insuree', this.props)
        return(
            <InsureeRelationPicker        
            onSelect={this.onSelect}
            value={this.props.onChange}   
            label="relation"
            />
        )
    }
}

export default Relation;


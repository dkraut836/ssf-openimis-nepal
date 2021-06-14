import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import { fade, withStyles, withTheme } from '@material-ui/core/styles';
import { InputBase } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { formatMessage } from "@openimis/fe-core";
import EnquiryDialog from "./EnquiryDialog";

const styles = theme => ({
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 120,
      '&:focus': {
        width: 200,
      },
    },
  },
});

class Enquiry extends Component {

  state = { open: false }

  handleKeyPress = event => {
    if (event.charCode === 13) {
      this.setState({ 
        open: true,
        chfid: event.target.value
      });
    }
  }

  handleClose = () => {
    this.setState({ open: false});
  };  

  render() {
    const { classes, intl, ...others } = this.props;
    return (      
      <div className={classes.search}>
        <EnquiryDialog open={this.state.open} chfid={this.state.chfid} onClose={this.handleClose} {...others}/>
        <div className={classes.searchIcon}>
          <SearchIcon />
        </div>
        <InputBase
          placeholder={formatMessage(intl, 'insuree', 'appBar.enquiry')}
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          onKeyPress={e => this.handleKeyPress(e)}
        />
      </div>
    );
  }
}

export default injectIntl(withTheme(withStyles(styles)(Enquiry)));

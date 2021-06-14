import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/SaveAlt";
import DeleteIcon from "@material-ui/icons/Delete";
import FileIcon from "@material-ui/icons/Add";
import {
    Dialog, DialogTitle, Divider, Button,
    DialogActions, DialogContent, Link, IconButton
} from "@material-ui/core";
import {
    FormattedMessage, withModulesManager, ProgressOrError, Table, TextInput,
    PublishedComponent,
    formatMessage, formatMessageWithValues,withHistory, historyPush,
    journalize, coreConfirm
} from "@openimis/fe-core";
import { fetchClaimAttachments, downloadAttachment, deleteAttachment, createAttachment, updateAttachment } from "../actions";
import { RIGHT_ADD } from "../constants";
import CheckAttachmentPicker from "../pickers/CheckAttachmentPicker";
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';

const styles = theme => ({
    dialogTitle: theme.dialog.title,
    dialogContent: theme.dialog.content,
    appBar: {
        position: 'relative',
      },
});


class CheckAttachment extends Component {
    state = {
        open: false,
        claimUuid: null,
        claimAttachments: [],
        attachmentToDelete: null,
        updatedAttachments: new Set(),
        reset: 0,
        show:false,
        image:''
    }

    componentDidUpdate(prevProps, props, snapshot) {
        
        const { readOnly = false } = this.props;
        if (!_.isEqual(prevProps.claimAttachments, this.props.claimAttachments)) {
            var claimAttachments = [...(this.props.claimAttachments || [])]
            if (!this.props.readOnly && this.props.rights.includes(RIGHT_ADD)) {
                claimAttachments.push({});
            }
            this.setState({ claimAttachments, updatedAttachments: new Set() });
        } else if (!_.isEqual(prevProps.claim, this.props.claim) && !!this.props.claim && !!this.props.claim.uuid) {
            this.setState({ open: true, claimUuid: this.props.claim.uuid, claimAttachments: readOnly ? [] : [{}], updatedAttachments: new Set() },
                e => {
                    if (!!this.props.claim && !!this.props.claim.uuid) {
                        this.props.fetchClaimAttachments(this.props.claim,"R");
                    }
                })
        } else if (!_.isEqual(prevProps.claim, this.props.claim) && !!this.props.claim && !this.props.claim.uuid) {
            let claimAttachments = [...(this.props.claim.attachments || [])]
            if (!readOnly) {
                claimAttachments.push({})
                this.props.onUpdated()
            }
            this.setState({ open: true, claimUuid: null, claimAttachments, updatedAttachments: new Set() });
        } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
            var claimAttachments = [...this.state.claimAttachments];
            if (!!this.state.attachmentToDelete) {
                claimAttachments = claimAttachments.filter(a => a.id !== this.state.attachmentToDelete.id)
            } else if (!_.isEqual(_.last(claimAttachments), {})) {
                claimAttachments.push({})
            }
            this.setState(
                {
                    claimAttachments,
                    updatedAttachments: new Set(),
                    attachmentToDelete: null,
                    reset: this.state.reset + 1
                }
            )
            // called from ClaimForm!
            // this.props.journalize(this.props.mutation);
        } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.attachmentToDelete) {
            this.props.deleteAttachment(
                this.state.attachmentToDelete,
                formatMessageWithValues(this.props.intl, "claim", "claim.ClaimAttachment.delete.mutationLabel", {
                    file: `${this.state.attachmentToDelete.title} (${this.state.attachmentToDelete.filename})`,
                    code: `${this.props.claim.code}`
                }))
        }
    }

    handleClickOpen = (a,i) => {
        this.setState({show:true});
        this.openBlob(a,i)
      };
    
      handleClose = () => {
        this.setState({show:false});
      };

    onClose = () => this.setState({ open: false },
        e => !!this.props.close && this.props.close())

    delete = (a, i) => {
        if (!!a.id) {
            this.setState(
                { attachmentToDelete: a },
                e => this.props.coreConfirm(
                    formatMessage(this.props.intl, "claim", "deleteClaimAttachment.confirm.title"),
                    formatMessageWithValues(this.props.intl, "claim", "deleteClaimAttachment.confirm.message",
                        {
                            file: `${a.title} (${a.filename})`,
                        }),
                ))
        } else {
            var claimAttachments = [...this.state.claimAttachments]
            claimAttachments.splice(i, 1)
            claimAttachments.pop()
            this.props.claim.attachments = [...claimAttachments]
            claimAttachments.push({})
            this.setState({ claimAttachments, reset: this.state.reset + 1 })
        }
    }

    addAttachment = document => {
        let attachment = { ..._.last(this.state.claimAttachments), document }
        if (!!this.state.claimUuid) {
            this.props.createAttachment(
                { ...attachment, claimUuid: this.state.claimUuid, documentFrom:"R"},
                formatMessageWithValues(this.props.intl, "claim", "claim.ClaimAttachment.create.mutationLabel", {
                    file: `${attachment.title} (${attachment.filename})`,
                    code: `${this.props.claim.code}`
                }))
        } else {
            if (!this.props.claim.attachments) {
                this.props.claim.attachments = []
            }
            this.props.claim.attachments.push(attachment)
            var claimAttachments = [...this.state.claimAttachments]
            claimAttachments.push({});
            this.setState({ claimAttachments })
        }
    }

    update = i => {
        let attachment = { claimUuid: this.state.claimUuid, ...this.state.claimAttachments[i] }
        this.props.updateAttachment(
            attachment,
            formatMessageWithValues(this.props.intl, "claim", "claim.ClaimAttachment.update.mutationLabel", {
                file: `${attachment.title} (${attachment.filename})`,
                code: `${this.props.claim.code}`
            })
        )
    }

    download = a => {
        this.props.downloadAttachment(a)
    }

    fileSelected = (f, i) => {
        if (!!f.target.files) {
            const file = f.target.files[0];
            let claimAttachments = [...this.state.claimAttachments]
            claimAttachments[i].filename = file.name
            claimAttachments[i].mime = file.type
            this.setState({ claimAttachments },
                e => {
                    var reader = new FileReader();
                    reader.onloadend = loaded => {                        
                        this.addAttachment(btoa(loaded.target.result))
                    }
                    reader.readAsBinaryString(file);
                })
        }
    }

    formatFileName(a, i) {
        if (!!a.id) return <Link onClick={e => this.download(a)} reset={this.state.reset}>{a.filename || ""}</Link>
        if (!!a.filename) return <i>{a.filename}</i>
        return (
            <IconButton
                variant="contained"
                component="label" >
                <FileIcon />
                <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={f => this.fileSelected(f, i)}
                />
            </IconButton>
        )
    }

     openBlob =(a,i)=> {
         console.log('aaaaaaa',a)
         console.log('aaaaaaa aaa',i)

            this.setState({
                image:`data:${this.props.claimAttachments[i].mime};base64,${this.props.claimAttachments[i].document}`
            })   
      }

    previewImage=(a,i)=>{
        window.open(historyPush(this.props.modulesManager, this.props.history, "claim.route.imgPreview"))        
    }

    updateAttachment = (i, key, value) => {
        this.state.claimAttachments[i][key] = value;
        this.state.updatedAttachments.add(i)
        this.setState({ reset: this.state.reset + 1 })
    }

    cannotUpdate = (a, i) => { 
        
        i < this.state.claimAttachments.length - 1 && !!this.state.claimUuid && !a.id 
    }

    render() {
        console.log('dataaa is', this.state.image)
        const { classes, claim, readOnly = false,
            fetchingClaimAttachments, errorClaimAttachments,edited } = this.props;
        const { open, claimAttachments } = this.state;
        claimAttachments != [] ? console.log('claimm', claimAttachments) : null
        console.log('onlyy', readOnly)
        if (!claim) return null;
        var headers = [
            "claimAttachment.masterDocument",
            "claimAttachment.title",
            "claimAttachment.date",
            "claimAttachment.fileName"
        ]
        var itemFormatters = [
            (a, i) => this.cannotUpdate(a, i) ? this.state.claimAttachments[i].masterDocument : (
                <CheckAttachmentPicker
                claim={claim}
                value={this.state.claimAttachments[i].masterDocument}
                withNull={true}
                reset={this.state.reset}
                onChange={v => this.updateAttachment(i, "masterDocument", v)}
            />
                ),
            (a, i) => this.cannotUpdate(a, i) ? this.state.claimAttachments[i].title : (
                <TextInput
                    reset={this.state.reset}
                    value={this.state.claimAttachments[i].title}
                    onChange={v => this.updateAttachment(i, "title", v)}
                />),
            (a, i) => this.cannotUpdate(a, i) ? this.state.claimAttachments[i].date : (
                <PublishedComponent
                    id="core.DatePicker"
                    onChange={v => this.updateAttachment(i, "date", v)}
                    value={this.state.claimAttachments[i].date || null}
                    reset={this.state.reset} />
            ),
            (a, i) => this.formatFileName(a, i),      
        ];

         if (!readOnly) {
            headers.push("claimAttachment.action");
            itemFormatters.push((a, i) => {
                if (!!a.id && this.state.updatedAttachments.has(i)) {
                    return <IconButton onClick={e => this.update(i)}><SaveIcon /></IconButton>
                } else if (i < this.state.claimAttachments.length - 1) {
                    return (
                        <div>
                        <Button variant="outlined" color="primary" onClick={e => this.handleClickOpen(a,i)}> preview </Button>
                            <Dialog fullScreen open={this.state.show} onClose={this.handleClose}>
                                <AppBar className={classes.appBar}>
                                <Toolbar>
                                    <IconButton edge="start" color="inherit" onClick={this.handleClose} aria-label="close">
                                    <CloseIcon />
                                    </IconButton>
                                    <Typography variant="h6"   className={classes.title}>
                                    Image Preview
                                    </Typography>                                    
                                </Toolbar>
                                </AppBar>
                                <List>                                
                                <ListItem button>
                                <img src={this.state.image} />
                                </ListItem>
                                </List>
                            </Dialog>
                             <IconButton onClick={e => this.delete(a, i)}><DeleteIcon /></IconButton>
                        </div>
            )
                }
                return null;
            })
        }
        return (
            <React.Fragment>
            <Dialog
                open={open}
                fullWidth={true}
            >
                <DialogTitle className={classes.dialogTitle}>
                    <FormattedMessage module="claim" id="attachmentts.title" values={{ 'code': claim.code }} />
                </DialogTitle>
                <Divider />
                <DialogContent className={classes.dialogContent}>
                    <ProgressOrError progress={fetchingClaimAttachments} error={errorClaimAttachments} />
                    {!fetchingClaimAttachments && !errorClaimAttachments && (
                        <Table
                            module="claim"
                            items={claimAttachments}
                            headers={headers}
                            itemFormatters={itemFormatters}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onClose} color="primary">
                        <FormattedMessage module="claim" id="close" />
                    </Button>
                </DialogActions>
            </Dialog>
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    confirmed: state.core.confirmed,
    submittingMutation: state.claim.submittingMutation,
    mutation: state.claim.mutation,
    fetchingClaimAttachments: state.claim.fetchingClaimAttachments,
    fetchedClaimAttachments: state.claim.fetchedClaimAttachments,
    errorClaimAttachments: state.claim.errorClaimAttachments,
    claimAttachments: state.claim.claimAttachments
});


const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        { fetchClaimAttachments, downloadAttachment, deleteAttachment, createAttachment, updateAttachment, coreConfirm, journalize },
        dispatch);
};


    export default injectIntl(withModulesManager((withHistory(connect(mapStateToProps, mapDispatchToProps)(
        withTheme(withStyles(styles)(CheckAttachment))
    )))));
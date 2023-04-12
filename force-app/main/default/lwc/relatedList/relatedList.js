import { LightningElement, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import fetchData from '@salesforce/apex/RelatedListController.fetchData';
import saveRecord from '@salesforce/apex/RelatedListController.saveRecord';

const actions = [
    { label: 'Edit', name: 'edit' },
];

export default class RelatedList extends LightningElement {
    @api recordId;
    @api objectApiName;
    @api columns;

    data = [];
    sortedBy;
    sortedDirection = 'asc';
    showSpinner = true;
    showEditModal = false;
    selectedRecord;
    @wire(fetchData, { recordId: '$recordId', objectApiName: '$objectApiName' })
    wiredData({ error, data }) {
        if (data) {
            this.data = data.map(row => ({...row, Name: row.Name || row.Id }));
            this.showSpinner = false;
        } else if (error) {
            //
        }
    }

    handleSort(event) {
        const { fieldName: sortedBy, sortDirection: sortedDirection } = event.detail;
        this.sortedBy = sortedBy;
        this.sortedDirection = sortedDirection;
        this.showSpinner = true;
        this.fetchData();
    }

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        switch (action.name) {
            case 'edit':
                this.showEditModal = true;
                this.selectedRecord = {...row};
                break;
            default:
        }
    }

    handleSave(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        fields.Id = this.selectedRecord.Id;
        this.showSpinner = true;
        saveRecord({ fields: fields })
            .then(() => {
                this.showSpinner = false;
                this.showEditModal = false;
                return refreshApex(this.wiredData);
            })
            .catch(error => {
                console.log(error);
            });
    }

    handleCancel() {
        this.showEditModal = false;
    }

    get sortedData() {
        let data = [...this.data];
        if (this.sortedBy) {
            const reverse = this.sortedDirection === 'asc' ? 1 : -1;
            data = data.sort((a, b) => {
                if (a[this.sortedBy] > b[this.sortedBy]) {
                    return 1 * reverse;
                } else if (a[this.sortedBy] < b[this.sortedBy]) {
                    return -1 * reverse;
                } 
                return 0;
                
            });
        }
        return data;
    }

    get tableActions() {
        return actions;
    }
}


   

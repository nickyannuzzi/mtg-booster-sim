import React, { Component } from 'react';

import axios from 'axios';


class SetDropdown extends Component {
    setMap = {};
    constructor(props) {
        super(props);
        this.state =
        {
            setData: {},
            setMap: {},
            selectedSet: ''
        }
        this.handleOpenPack = this.handleOpenPack.bind(this);
        this.handleChange = this.handleChange.bind(this);

    }
    componentDidMount() {
        //get sets from mtg api, add to state

        axios.get('https://api.magicthegathering.io/v1/sets?type=expansion').then(data =>
            this.updateSets(data)
        );
    }
    componentDidUpdate() {
        console.log(this.state);
    }
    updateSets(argData) {
        //return dropbox element with all sets?
        var setInformation = argData.data.sets;
        this.setState({ setData: { setInformation } }); //update state

        //make map set.name -> set object
        var dict = {};
        setInformation.map((mtgSet) => dict[mtgSet.name] = mtgSet); //is there a better react way to do this?
        console.log(setInformation);
        this.setState({ setMap: dict });
        console.log(this.state);

    }
    handleOpenPack() {
        console.log('opening pack...');

        //TODO: open a pack! Will have to decide how many rares/commons per pack
    }

    handleChange(e) {
        if (e.target.value) {
            this.setState({selectedSet : e.target.value});
        }
    }


    render() {
        var options = [];
        Object.keys(this.state.setMap).forEach(x =>
            options.push({ 'value': this.state.setMap[x], 'label': x }));

        return (<div>
            <div className="dropdownMenu">
                <select onChange={this.handleChange} options={options}>
                    {options.map((option) => <option value={options.value}>{option.label}</option>)}
                </select>
            </div>
            <button type="button" onClick={this.handleOpenPack}>Open pack!</button>
        </div>);
    }


}



export default SetDropdown;
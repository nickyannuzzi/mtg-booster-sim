import React, { Component } from 'react';
import Select from 'react-select';

import axios from 'axios';


class SetDropdown extends Component {
    setMap = {};
    constructor(props) {
        super(props);
        this.state =
        {
            setData: {},
            setMap: {},
            selectedSet : ''
        }
    }
    componentDidMount() {
        //get sets from mtg api, add to state

        axios.get('https://api.magicthegathering.io/v1/sets?type=expansion').then(data =>
            this.updateSets(data)
        );
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
    handleOpenPack()
    {
        console.log('opening pack...');
    }
    handleChange(e) {
        this.setState({selectedSet : e.target.value});
        console.log(this.state.selectedSet);
    };
    
    render() {
        var options = [];
        Object.keys(this.state.setMap).forEach(x =>
            options.push({ 'value': this.state.setMap[x], 'label': x }));

        return (<div>
            <div className="dropdownMenu">
                <Select options={options}> onChange={this.handleChange}</Select>
            </div>
            <button type = "button" onClick={this.handleOpenPack}>Open pack!</button>
        </div>);
    }


}
export default SetDropdown;
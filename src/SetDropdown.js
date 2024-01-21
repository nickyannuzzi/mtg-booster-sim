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
       // console.log(this.state);
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
        this.setState({selectedSet : setInformation[0].name});
        console.log(this.state);

    }
    
    handleOpenPack() {
        console.log(this.state.selectedSet + ' opening pack...');

        let set = this.state.selectedSet;
        let boosterTemplate = {};
        if(this.state.setMap[set].booster){
            console.log(this.state.setMap[set].booster);
            boosterTemplate = this.convertBooster(this.state.setMap[set].booster);
        }else{
            boosterTemplate = this.convertBooster();
        }

        console.log(boosterTemplate);

        let payload = {"set" : set};
        axios.post("https://api.scryfall.com/cards/collection",payload).then(response=>{
            console.log(response);
        })

        //TODO: open a pack! Will have to decide how many rares/commons per pack
    }

    handleChange(e) {
        if (e.target.value) {
            this.setState({selectedSet : e.target.value});
        }
    }

    convertBooster(booster){
        if(booster == null){
            let retVal = {
                "rare" : 1,
                "uncommon" : 3,
                "common" : 11
            }
            return retVal;
        }
        
        console.log(booster);
        
       
        let rareCount = 0;
        let uncommonCount = 0;
        let commonCount = 0;
        booster.forEach(b =>{
            switch(b){
                case "rare": rareCount ++; break;
                case "uncommon" : uncommonCount ++; break;
                case "common" : commonCount ++; break;
                default : commonCount ++; break;
            }

        })
        let retVal = {
            "rare" : rareCount,
            "uncommon" : uncommonCount,
            "common" : commonCount
        }
        return retVal;
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
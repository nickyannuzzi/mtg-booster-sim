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
            selectedSet: '',
            commonList : [],
            uncommonList : [],
            rareList : [],
            openedCards : [],
            imageUrl: ""
        }
        this.state.openedCards.push({});
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
    async updateSets(argData) {
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
    async grabCardsForSet(set){
        let code = "";
        //get number of cards in set
        let setSize;
        await axios.get("https://api.scryfall.com/sets/" + this.state.setMap[set].code).then(response=>{
            if(response.data.card_count)
                setSize = response.data.card_count;
            if(response.data.code){
                code = response.data.code;
            }
        })

        //get all cards
      
       
        await this.getCardsForSet(code,setSize);
        document.getElementById("open-button").disabled = false;
    }

    
    async handleOpenPack() {
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


      

        let openedCards = [];
        this.state.openedCards = [];

        for(let i = 0; i < boosterTemplate.rare; i ++){
            let card = this.state.rareList[Math.floor(Math.random()*this.state.rareList.length)];
            openedCards.push(card);
        }

        for(let i = 0; i < boosterTemplate.uncommon; i ++){
            let card = this.state.uncommonList[Math.floor(Math.random()*this.state.uncommonList.length)];
            openedCards.push(card);
        }

        for(let i = 0; i < boosterTemplate.common; i ++){
            let card = this.state.commonList[Math.floor(Math.random()*this.state.commonList.length)];
            openedCards.push(card);
        }

        this.state.openedCards = openedCards;
        this.setState({imageUrl : openedCards[0].image_uris.small})
       
        console.log("Set contains some cards!");
        console.log("you opened: " + openedCards);

        //TODO: open a pack! Will have to decide how many rares/commons per pack
    }

    handleChange(e) {
        if (e.target.value) {
            this.setState({selectedSet : e.target.value});
            this.grabCardsForSet(e.target.value);
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
            if(Array.isArray(b)){
                if(b[0]){
                    rareCount ++;
                }
            }
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

    async getCardsForSet(setCode,setSize){
        this.state.rareList = [];
        this.state.uncommonList = [];
        this.state.commonList = [];
        document.getElementById("open-button").disabled = true;

        for (let i = 1; i < setSize; i ++){
            await axios.get("https://api.scryfall.com/cards/" + setCode + "/" + i).then(card=>{
                if(card != null){
                    if(card.data != null){
                        if(card.data.rarity === "rare" || card.data.rarity === "mythic"){
                            this.state.rareList.push(card.data);
                        }
                        else if(card.data.rarity === "uncommon"){
                            this.state.uncommonList.push(card.data)
                        }
                        else{
                            this.state.commonList.push(card.data);
                        }
                    }
                   

                }
            }).catch(e=>{
                console.log("got a dud!!");
            })};
        
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
            <button type="button" id="open-button" onClick={this.handleOpenPack}>Open pack!</button>
            <br></br>
            <img src={this.state.imageUrl} alt={this.state.openedCards.name}></img>
        </div>);
    }


}



export default SetDropdown;
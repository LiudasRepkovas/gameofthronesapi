import mongoose, { Schema } from 'mongoose';
import escape from 'escape-string-regexp';
import * as _ from 'lodash';

let battleSchema = new Schema({
    name: String,
    year: Number,
    battle_number: Number,
    attacker_king: String,
    defender_king: String,
    attacker_1: String,
    attacker_2: String,
    attacker_3: String,
    attacker_4: String,
    defender_1: String,
    defender_2: String,
    defender_3: String,
    defender_4: String,
    attacker_outcome: String,
    battle_type: String,
    major_death: Number,
    major_capture: Number,
    attacker_size: Number,
    defender_size: Number,
    attacker_commander: String,
    defender_commander: String,
    summer: Number,
    location: String,
    region: String,
    note: String
});

battleSchema.statics.mostFrequentFieldValue = function(name){

    return this.aggregate([
        {
            $group: {_id: "$"+name, count: {$sum: 1}},
        },
    ]).then( values => {
        return _.maxBy(values, 'count')._id;
    });
}

battleSchema.statics.averageFieldValue = function(name){
    return this.aggregate([{
        "$group": {"_id": null, "avg": { "$avg": "$"+name } }
    }]).then( values => {
        return values[0].avg;
    } )
}



battleSchema.statics.search = function(params){
    return this.find(buildQuery(params)).exec();
}

function buildQuery(params){
    let query = {$and:[]}
    if(params.name){
        query.name = params.name;
    }
    if(params.year_from){
        query.year = {}
        query.year.$gt = Number(params.year_from) - 1;
    }
    if(params.year_to){
        if(!query.year) query.year = {};
        query.year.$lt = Number(params.year_to) + 1;
    }
    if(params.year){
        query.year = Number(params.year);
    }
    if(params.battle_number){
        query.battle_number = Number(params.battle_number);
        
    }
    if(params.king){
        query.$and.push({$or:[
            {attacker_king:{$regex:escape(params.king), $options: '-i'}},
            {defender_king:{$regex:escape(params.king), $options: '-i'}}
        ]})
        // query.$or.push();
        // query.$or.push();
    }
    if(params.attacker_king){
        query.attacker_king = {$regex:escape(params.attacker_king), $options: '-i'}
    }
    if(params.defender_king){
        query.defender_king = {$regex:escape(params.defender_king), $options: '-i'}
    }
    if(params.attacker){
        query.$and.push({$or:[
            {attacker_1:{$regex:escape(params.attacker), $options: '-i'}},
            {attacker_2:{$regex:escape(params.attacker), $options: '-i'}},
            {attacker_3:{$regex:escape(params.attacker), $options: '-i'}},
            {attacker_4:{$regex:escape(params.attacker), $options: '-i'}}
        ]});
        
        // query.$or.push();
        // query.$or.push();
        // query.$or.push();
    }
    if(params.defender){
        query.$and.push({$or:[
            {defender_1:{$regex:escape(params.defender), $options: '-i'}},
            {defender_2:{$regex:escape(params.defender), $options: '-i'}},
            {defender_3:{$regex:escape(params.defender), $options: '-i'}},
            {defender_4:{$regex:escape(params.defender), $options: '-i'}},
        ]});
    }
    if(params.attacker_outcome){
        query.attacker_outcome = params.attacker_outcome;
    }
    if(params.battle_type){
        query.battle_type = {$regex:escape(params.battle_type), $options: '-i'}
    }
    if(params.attacker_size_from){
        query.attacker_size = {}
        query.attacker_size.$gt = Number(params.attacker_size_from) - 1;
    }
    if(params.attacker_size_to){
        if(!query.attacker_size) query.attacker_size = {};
        query.attacker_size.$lt = Number(params.attacker_size_to) + 1;
    }
    if(params.attacker_size){
        query.attacker_size = Number(params.attacker_size);
    }
    if(params.defender_size_from){
        query.defender_size = {}
        query.defender_size.$gt = Number(params.defender_size_from) - 1;
    }
    if(params.defender_size_to){
        if(!query.defender_size) query.defender_size = {};
        query.defender_size.$lt = Number(params.defender_size_to) + 1;
    }
    if(params.defender_size){
        query.defender_size = Number(params.defender_size);
    }
    if(params.summer){
        query.summer = Number(params.summer);
    }
    if(params.location){
        query.location =  {$regex:escape(params.location),  $options: '-i'};
    }
    if(params.region){
        query.region = {$regex:escape(params.region),  $options: '-i'};
    }
    if(params.note){
        query.note = {$regex:escape(params.note),  $options: '-i'};
    }
    if(!query.$and.length){
        delete query.$and;
    }
    
    return query;
}

let Battle = mongoose.model('Battle', battleSchema);

export {Battle}
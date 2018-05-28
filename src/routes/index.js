import {Router} from 'express';
import {Battle} from '../models/battle';

let router = new Router();

router.get('/list', function(req, res, next) {
  Battle.distinct('location').then( data => {
    res.send(data.filter( item => {return item != null}));
  }).catch(next);
});

router.get('/count', function(req, res, next) {
  Battle.count({}).then( count => {
    res.send(String(count));
  }).catch(next);
}); 

router.get('/stats', function(req, res, next) {
  Promise.all(
    [
      Battle.mostFrequentFieldValue('attacker_king'),
      Battle.mostFrequentFieldValue('defender_king'),
      Battle.mostFrequentFieldValue('region'),
      //Battle.mostFrequentFieldValue('name'),
      Battle.count({attacker_outcome: 'win'}),
      Battle.count({attacker_outcome: 'loss'}),
      Battle.distinct('battle_type'),
      Battle.averageFieldValue('defender_size'),
      Battle.findOne({defender_size:{$ne:null}}).sort({defender_size: 1}).select('defender_size').exec(),
      Battle.findOne({defender_size:{$ne:null}}).sort({defender_size: -1}).select('defender_size').exec(),
    ]
  ).then( values => {
    res.send({
      most_active:{
        attacker_king: values[0],
        defender_king: values[1],
        region: values[2],
        //name: values[3]
      },
      attacker_outcome:{
        win:values[3],
        loss: values[4]
      },
      battle_type: values[5].filter(type => {return type != null}),
      defender_size:{
        average: values[6],
        min: values[7].defender_size,
        max: values[8].defender_size
      }
    })
  }).catch(next);
});

router.get('/search', function(req, res, next) {
  Battle.search(req.query).then( result => res.send(result) ).catch(next);
});

export default router;

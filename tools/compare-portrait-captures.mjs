import{readFileSync,writeFileSync}from'node:fs';
const dir='reviews/passenger-portraits/';
const before=JSON.parse(readFileSync(dir+'before/capture-manifest.json'));
const after=JSON.parse(readFileSync(dir+'after/capture-manifest.json'));
const comparisons=[];
const framing = ({revision,...value}) => value;
for(const next of after.runs){
  const old=before.runs.find(r=>r.viewport.width===next.viewport.width&&r.viewport.height===next.viewport.height);
  const labels=['play','sheep-choice','rabbit-boarding','harbor-preview'];
  const pairs=labels.map(label=>{
    const b=old.captures.find(c=>c.label===label),a=next.captures.find(c=>c.label===label);
    return{label,before:{path:b.path,sha256:b.sha256},after:{path:a.path,sha256:a.sha256},committedStateEqual:JSON.stringify(b.observation.state)===JSON.stringify(a.observation.state),rawViewEqual:JSON.stringify(b.observation.view)===JSON.stringify(a.observation.view),viewRevision:{before:b.observation.view.revision,after:a.observation.view.revision},framingEqual:JSON.stringify(framing(b.observation.view))===JSON.stringify(framing(a.observation.view)),beforeChoiceHeights:b.measurement?.choices.map(c=>c.rect.height)??null,afterChoiceHeights:a.measurement?.choices.map(c=>c.rect.height)??null,afterFitFailures:a.measurement?.failures??null};
  });
  const b=old.captures.find(c=>c.label==='play').observation,a=next.captures.find(c=>c.label==='play').observation;
  comparisons.push({viewport:next.viewport,pairs,hudHeight:{before:b.hudRect.height,after:a.hudRect.height},initialFerryWidth:{before:b.ferryRect.right-b.ferryRect.left,after:a.ferryRect.right-a.ferryRect.left,ratio:(a.ferryRect.right-a.ferryRect.left)/(b.ferryRect.right-b.ferryRect.left)}});
}
const result={scope:'Actual UI native-size comparisons, same committed state and selection at sheep unload, two-rabbit boarding and three-passenger Harbor beforeConfirm. Natural ambient water/lighthouse phase is not time-locked. Raw view revision counters are recorded separately because they count animation/layout updates; every actual framing value must still match exactly. Both runs include a full rescue, tide Undo and terminal Undo/redelivery.',beforeSource:'before/source.json',afterSource:'after/source.json',comparisons};
if(comparisons.length!==6||comparisons.some(c=>c.pairs.some(p=>!p.committedStateEqual||!p.framingEqual||(p.afterFitFailures?.length??0)>0)||Math.abs(c.hudHeight.before-c.hudHeight.after)>0.01||Math.abs(c.initialFerryWidth.ratio-1)>0.000001))throw Error('Matched capture check failed');
writeFileSync(dir+'matched-comparisons.json',JSON.stringify(result,null,2)+'\n');console.log({matchedSizes:comparisons.length,matchingStates:true,hudHeightUnchanged:true,initialFerryWidthUnchanged:true});

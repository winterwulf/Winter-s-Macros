// Name of the folder in which the beasts are located
let beastsFolder = "Beasts"

// Name of your WildShape Effect
let wildShapeEffectName = "WildShape"

/////////////////////////////////////////////////////

// Declare the target
let target = canvas.tokens.controlled[0]
console.log("======================||==================")
console.log(target)

// Get the ID of your the actual target (current Actor Form)
let currentFormActorId = target.actor.data._id
console.log("======================||==================")
console.log(currentFormActorId)

// Declare my WildShape transformation function
let wildShapeTransform = async function (actorOriginalForm, actorNewFormId) {

    // Image's Token associated with the original actor form
    let actorOriginalFormImagePath = actorOriginalForm.data.token.img

    // Get the New Form Actor
    let actorNewForm = game.actors.get(actorNewFormId)
    // Set the token rotation to default value
    //actorNewForm._data.token.rotation = 0
    // Image's Token associated with the new actor form
    let actorNewFormImagePath = actorNewForm.data.token.img

    // Get the New Shape Actor Name
    let actorNewShapeName = actorOriginalForm.data.name + ' (' + actorNewForm.data.name + ')'

    // Declare the polymorph function
    let actorPolymorphism = async function () {
        // For actorNewForm, the ratio's Token scale should be the same of the original form
        actorOriginalForm.transformInto(actorNewForm, {
            keepMental: true,
            mergeSaves: true,
            mergeSkills: true,
            keepBio: true,
            keepClass: true,
        })
    }

    // Declare the WildShape Effect
    const applyWildShapeEffect = [{
        label: wildShapeEffectName,
        icon: "systems/dnd5e/icons/skills/green_13.jpg",
        changes: [{
            "key": "macro.execute",
            "mode": 1,
            "value": `"wildshape-effect"` + `"${currentFormActorId}"` + `"${actorOriginalFormImagePath}"` + `"${actorNewFormId}"` + `"${actorNewShapeName}"`,
            "priority": "20"
        }],
        duration: {
            "seconds": 7200,
        }
    }]

    // Declare the delay variable to adjust with animation
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

    // If not already polymorphed, launch startAnimation function
    if (!actor.data.flags.dnd5e?.isPolymorphed) {
        console.log("primeiro IF")
        let paramsStart = [{
            filterType: "polymorph",
            filterId: "polymorphToNewForm",
            type: 6,
            padding: 70,
            magnify: 1,
            imagePath: actorNewFormImagePath,
            animated:
            {
                progress:
                {
                    active: true,
                    animType: "halfCosOscillation",
                    val1: 0,
                    val2: 100,
                    loops: 1,
                    loopDuration: 1500
                }
            },
            autoDisable: false,
            autoDestroy: false
        }]

        //game.macros.getName("Energy Strands").execute()
        //await delay(500)
        // target.document.update({
        //     "width": actorNewForm.data.token.width,
        //     "height": actorNewForm.data.token.height
        // })
        
        async function startAnimation() {
//             await token.TMFXhasFilterId("polymorphToNewForm")
//             console.log("======================||==================\nTMFX:")
// console.log(await token.TMFXhasFilterId("polymorphToNewForm"))
            await TokenMagic.addUpdateFilters(target, paramsStart)
            await delay(1500)
            await actorPolymorphism()
            await delay(500)
            //await token.TMFXdeleteFilters("polymorphToNewForm")
            await TokenMagic.deleteFilters(_token)
            let actorNewShape = game.actors.getName(actorNewShapeName)
            await actorNewShape.createEmbeddedDocuments("ActiveEffect", applyWildShapeEffect)
            //Sequencer.EffectManager.endEffects({name: "EnergyStrand"})
            //await removeDAEEffects().catch(err => console.error(err))
        }
        startAnimation()
        await delay(500)
        game.macros.getName("Energy Strands").execute()
        await delay(1000)
        Sequencer.EffectManager.endEffects({name: "EnergyStrand"})

        // If actor is polymorphed, launch backAnimation function
    } else {
        console.log("primeiro ELSE")
        // Image's Token associated with the original actor form
        actorOriginalFormImagePath = actorOriginalForm.data.token.img
        let paramsBack =
            [{
                filterType: "polymorph",
                filterId: "polymorphToOriginalForm",
                type: 6,
                padding: 70,
                magnify: 1,
                imagePath: actorOriginalFormImagePath,
                animated:
                {
                    progress:
                    {
                        active: true,
                        animType: "halfCosOscillation",
                        val1: 0,
                        val2: 100,
                        loops: 1,
                        loopDuration: 1000
                    }
                }
            }]
        target.document.update({
            "width": actorOriginalForm.data.token.width,
            "height": actorOriginalForm.data.token.height
        })
        async function backAnimation() {
            // console.log("======================||==================\nTMFX:")
            // console.log(await token.TMFXhasFilterId("polymorphToNewForm"))
            // token.TMFXhasFilterId("polymorphToOriginalForm")
            token.TMFXaddUpdateFilters(paramsBack)
            await delay(1500)
            await actor.revertOriginalForm()
            //await token.TMFXdeleteFilters("polymorphToOriginalForm")
            await TokenMagic.deleteFilters(_token)
            actorOriginalForm.effects.find(i => i.data.label === wildShapeEffectName).delete()
        }
        backAnimation()
    }
}
//game.actors.getName("Shazi").effects.find(i => i.data.label === "Feature Wildshape").delete()
// If not already polymorphed, display the dialog box
if (!actor.data.flags.dnd5e?.isPolymorphed) {
    console.log("segundo IF")
    let actorOriginalForm = game.actors.get(currentFormActorId)
    let selectBeasts = '<form><div class="form-group"><label>Choose the beast: </label><select id="wildShapeBeasts">';
    game.folders.getName(beastsFolder).content.forEach(function (beast) {
        let optBeast = '<option value="' + beast.data._id + '">' + beast.data.name + '</option>';
        selectBeasts += optBeast;
    });
    selectBeasts += '</select></div></form>'
    new Dialog({
        title: "DnD5e-WildShape",
        content: selectBeasts,
        buttons: {
            yes: {
                icon: '<i class="fas fa-paw"></i>',
                label: "Roar!",
                callback: () => {
                    // Get the New Form Actor ID
                    let actorNewFormId = $('#wildShapeBeasts').find(":selected").val();
                    wildShapeTransform(actorOriginalForm, actorNewFormId);
                }
            }
        }
    }).render(true);
    // Else, launch the WildShape transformation function
 } else {
    console.log("segundo ELSE")
    let actorOriginalId = game.actors.get(currentFormActorId).data.flags.dnd5e.originalActor
    let actorOriginalForm = game.actors.get(actorOriginalId)
    let actorNewFormId = _token.actor.data._id
    wildShapeTransform(actorOriginalForm, actorNewFormId);
}
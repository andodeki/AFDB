<script>
  export let fieldObject;
  import { HealthCondition } from "/imports/api/mainObjects/healthConditionModel";

  let healthConditionsLoading = true;
  let healthConditions = [];

  let healthConditionsSubscriber = Meteor.subscribe("healthConditions");

  $m: {
    if (healthConditionsSubscriber.ready()) {
      //filter with id
      fieldObject.body.all.forEach((healthConditionId) => {
        let healthCondition = HealthCondition.findOne({
          _id: healthConditionId,
        });
        if (healthCondition) {
          healthConditions.push(healthCondition);
        }
      });
      if (healthConditions) {
        healthConditionsLoading = false;
      }
    }
  }
</script>

<div>
  <p>Version {fieldObject.version.number}</p>
  {#if !fieldObject.body.nA}
    {#if !healthConditionsLoading}
      <ul>
        {#each healthConditions as healthCondition}
          <li>
            <a href={"/health-conditions/show/" + healthCondition._id}
              >{healthCondition.title}</a
            >
          </li>
        {/each}
      </ul>
    {/if}
  {:else}
    <p>
      <i>N/A</i>
    </p>
  {/if}
  <p>Author: {fieldObject.authorUsername}</p>
</div>

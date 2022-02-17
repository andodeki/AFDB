<script>
  import { meta, Route } from "tinro";

  import Home from "./Home";

  import MainObjectsIndex from "../mainObjects/Index";
  import MainObjectsShow from "../mainObjects/Show";
  import MainObjectsCreate from "../mainObjects/Create";
  import NoPageFound from "./NoPageFound";
  import Test from "./Test";
  import Workpile from "../workpile/Workpile";
  import InspectSource from "../workpile/InspectSource.svelte";
</script>

<Route>
  <Route path="/">
    <Home />
  </Route>

  <!--404-->
  <Route path="/404" let:meta>
    <NoPageFound />
  </Route>

  <!-- Actionable Findings Routes -->
  <Route path="/actionable-findings/*">
    <Route path="/index">
      <MainObjectsIndex mainObjectType={"actionableFindings"} />
    </Route>

    <Route path="/new">
      <MainObjectsCreate mainObjectType={"actionableFindings"} />
    </Route>

    <Route path="/show/:id" let:meta>
      <MainObjectsShow
        mainObjectType={"actionableFindings"}
        mainObjectId={decodeURI(meta.params.id)}
      />
    </Route>
  </Route>

  <!-- Debunked Myths Routes -->
  <Route path="/debunked-myths/*">
    <Route path="/index">
      <MainObjectsIndex mainObjectType={"debunkedMyths"} />
    </Route>

    <Route path="/new">
      <MainObjectsCreate mainObjectType={"debunkedMyths"} />
    </Route>

    <Route path="/show/:id" let:meta>
      <MainObjectsShow
        mainObjectType={"debunkedMyths"}
        mainObjectId={decodeURI(meta.params.id)}
      />
    </Route>
  </Route>

  <!-- Dietary Items Routes -->
  <Route path="/dietary-items/*">
    <Route path="/index">
      <MainObjectsIndex mainObjectType={"dietaryItems"} />
    </Route>

    <Route path="/new">
      <MainObjectsCreate mainObjectType={"dietaryItems"} />
    </Route>

    <Route path="/show/:id" let:meta>
      <MainObjectsShow
        mainObjectType={"dietaryItems"}
        mainObjectId={decodeURI(meta.params.id)}
      />
    </Route>
  </Route>

  <!-- Health Conditions Routes -->
  <Route path="/health-conditions/*">
    <Route path="/index">
      <MainObjectsIndex mainObjectType={"healthConditions"} />
    </Route>

    <Route path="/new">
      <MainObjectsCreate mainObjectType={"healthConditions"} />
    </Route>

    <Route path="/show/:id" let:meta>
      <MainObjectsShow
        mainObjectType={"healthConditions"}
        mainObjectId={decodeURI(meta.params.id)}
      />
    </Route>
  </Route>

  <!-- Sources Routes -->
  <Route path="/sources/*">
    <Route path="/index">
      <MainObjectsIndex mainObjectType={"sources"} />
    </Route>

    <Route path="/new">
      <MainObjectsCreate mainObjectType={"sources"} />
    </Route>

    <Route path="/show/:id" let:meta>
      <MainObjectsShow
        mainObjectType={"sources"}
        mainObjectId={decodeURI(meta.params.id)}
      />
    </Route>
  </Route>

  <!-- Test Route-->
  <Route path="/test">
    <Test />
  </Route>

  <!-- Workpile Route -->
  <Route path="/workpile/*">
    <Route path="/">
      <Workpile />
    </Route>
    <Route path="/inspect-source/:id" let:meta>
      <InspectSource sourceId={meta.params.id} />
    </Route>
  </Route>

  <!--fallback to redirect broken url to 404 page, but still keep url-->
  <Route fallback>
    <NoPageFound />
  </Route>
</Route>

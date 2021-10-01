# README

1. handle import must await for all the async functions evoked inside
    - otherwise, when executing the workflow, the step after initialization will be executed before initialization finishes
    - similarly, all the other steps in the workflow must await for all the async functions evoked inside themselves

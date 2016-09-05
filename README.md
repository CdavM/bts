BTS
=================

BTS is a platform to test various peer prediction mechanisms on crowdsourcing platforms.

Researchers wishing to use the platform can supply a list of questions, create small HTML templates for the UI and specify the payment mechanism. BTS does the rest.

## Features

- Each agent sees a different random permutation of the questions
- Multiple agents may work on the same question. Payment mechanism may rely on all answers in that round
- GUI to set up the experiment (beta feature)
- Built using the Meteor framework with MongoDB
- Export data from the experiments in a CSV format.

## Getting Started

To install a local copy of the platform, follow these instructions: 

1. [Install Meteor](https://www.meteor.com/install).
2. [Install Docker](https://docs.docker.com/engine/installation/)
2. Clone the directory:

    ```
    git clone https://github.com/CdavM/bts bts/
    ```

4. Start your app with the `docker run` command.
5. Navigate to `/setup` to configure the experiment

## Remote deployment
It is possible to deploy the platform via Amazon AWS. Once you provision a Ubuntu instance (14.04 LTS), follow the instructions above. 

## Examples

Multiple experiments have been deployed with this platform:
* Iterative decision making under various utility models [Stanford University]: https://github.com/cdavm/harp
* Estimating apriori probabilities (Is the Bayes rule intuitive?) [UC Berkeley]: https://github.com/CdavM/purple/
* Comparing output agreement mechanisms to state-of-the-art [UC Berkeley]: The master branch contains this experiment as the default setup.
* Comparing the confusion of agents: https://github.com/CdavM/bts/tree/comparison

## Contact
Feel free to open pull requests or issues on GitHub should you notice any bugs.

## License
This platform is licensed under the GPL 3.0 license.

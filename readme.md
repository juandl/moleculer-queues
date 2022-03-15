![Moleculer logo](http://moleculer.services/images/banner.png)

# moleculer-queues [![NPM version](https://img.shields.io/npm/v/moleculer-queues.svg)](https://www.npmjs.com/package/moleculer-queues)

Redis-based queue for moleculerjs using [Bull](https://github.com/OptimalBits/bull).

This package was created with the purpose of solving some problems with the original "moleculer-bull" package, with a new logic this module allows to run jobs manually using "methods" this to avoid "duplication of jobs when the service starts" , it also supports repetitive jobs just like "bull" does, each task is restarted every time the service stops thus avoiding task overload and "double-run"

The main idea of this package is to allow it to support multiple types of "queue" like (bee-queue, cron, etc) in the same way as a task monitor, so far it supports only "bull"

## Installation

Install my-project with npm

```bash
npm install moleculer-queues --save
```

or

```bash
yarn add moleculer-queues
```

## Usage/Examples

```javascript
const MoleculerQueues = require('moleculer-queues');

broker.createService({
  name: 'service-example',
  //Default redis is "localhost"
  mixins: [MoleculerQueues('PrefixName', { redis: 'redis://127.0.0.1:6379' })],
  methods: {
    yourMethod(payload) {
      //Some logic...

      this.addJobQueue('SendEmail', {
        //Your playload data..
      });
    },
  },
  queues: [
    {
      name: 'SendEmail',
      async handler(job, done) {
        this.logger.info('Sending notification..');

        //Some logic...

        return done(null, {
          message: 'Notification sent!',
        });
      },
    },
  ],
});
```

## To-do

- [ ] Unit Testing
- [ ] Real Example
- [ ] Add support for multiples "queues packages"
- [ ] Allow to add custom "queue processor"

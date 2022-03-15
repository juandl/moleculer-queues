![Moleculer logo](http://moleculer.services/images/banner.png)

# moleculer-queues [![NPM version](https://img.shields.io/npm/v/moleculer-queues.svg)](https://www.npmjs.com/package/moleculer-queues)

Redis-based queue for Node using [Bull](https://github.com/OptimalBits/bull).

## Installation

Install my-project with npm

```bash
npm install moleculer-bull --save
```

or

```bash
yarn add moleculer-bull
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

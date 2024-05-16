'use strict';

const Bull = require('bull');
const kleur = require('kleur');
const _ = require('lodash');

//Constants
const QueueOps = require('./constants/queues');

/**
 *
 * @param {String} JobId - Name of the job
 * @param {String} jobPrefix - Name of the prefix for each task
 * @param {import('@types/bull').QueueOptions} opts
 */
module.exports = function createService(
  jobName = 'molecQueues',
  jobPrefix,
  opts = QueueOps
) {
  /**
   * Task queue mixin service using bull
   *
   * @name moleculer-queues
   * @module Service
   */
  return {
    name: 'moleculerQueues',
    /**
     * Methods
     */
    methods: {
      /**
       * Get instance queue
       *
       * @param {String} name
       * @returns {Object}
       */
      getJobQueue(name) {
        let entity;

        //Search for the job process
        entity = _.find(this.$queues, (q) => q.name === name, null);

        return entity;
      },
      /**
       * Create a new job
       *
       * @param {String} name
       * @param {any} payload
       * @param {import('@types/bull').JobOptions} opts - Bull job options
       * @returns {import('@types/bull').Job}
       */
      addJobQueue(name, payload, opts) {
        /**
         * Default options
         */
        const options = _.defaultsDeep(opts, {
          removeOnComplete: true,
          removeOnFail: true,
        });

        //Get job
        const entity = this.getJobQueue(name);

        if (!entity) return;

        return entity.Queue.add(payload, options);
      },

      /**
       * Get a queue by name
       *
       * @param {Object} params
       * @param {String} params.name
       * @param {Promise} params.handler
       * @returns {Queue}
       */
      getQueue(params) {
        /**
         * Create task
         * @type {Array.<{name: String, handler: function, Queue:Object}
         */
        let entity;

        //Search for the job process
        entity = this.getJobQueue(params.name);

        //Create a new queue
        if (!entity) {
          //Assign params
          entity = {
            ...params,
          };

          try {
            /**
             * Create Bull instance
             */
            entity.Queue = new Bull(
              params.name,
              opts.redis,
              _.omit(
                {
                  prefix: `${jobName}:${jobPrefix}`, //Keep default using jobPrefix
                  ...opts,
                },
                ['redis']
              )
            );

            /**
             * Check for error connections on client
             */
            entity.Queue.client.on('error', (error) =>
              this.logger.info(
                kleur
                  .bgRed()
                  .white(
                    `moleculer-queues|Redis: ${params.name} Error Connection`
                  ),
                error
              )
            );
          } catch (err) {
            throw new Error(`moleculerQueues: Task can't start ${params.name}`);
          }

          //Push task to exists queues
          this.$queues.push(entity);
        }

        //return found entity
        return entity.Queue;
      },
    },

    /**
     * Service created lifecycle event handler
     */
    created() {
      /**
       * Create locally array of queues
       * @type {Array.<{name: String, handler: Promise, Queue: Object}>}
       */
      this.$queues = [];
    },

    /**
     * Service started lifecycle event handler
     */
    started() {
      const { queues } = this.schema;

      /**
       * Validate: Make sure prefix-job is defined
       */
      if (!jobPrefix) {
        throw new Error('moleculerQueues required a prefix name');
      }

      /**
       * Validate: Make sure prefix-job is defined
       */
      if (!opts.redis) {
        throw new Error('moleculerQueues required redis to work');
      }

      if (queues && Array.isArray(queues)) {
        /**
         * Go through each 'queues' and create a new Queue with a process
         */
        _.forEach(queues, (entity) => {
          let queue; // instance

          //If queue does't have any of this continue with next
          if (!entity.name) return;
          if (!entity.handler) return;

          //Search for a Queue if does't exist create new one
          queue = this.getQueue(entity);

          //Bind the handler and process job
          queue.process(entity.handler.bind(this));
        });
      }

      return this.Promise.resolve();
    },
    /**
     * Service stop lifecycle event handler
     */
    stopped() {
      /**
       * Go through each 'queues' and stop each one
       */
      _.forEach(this.$queues, (entity) => {
        //Clean all the jobs
        entity.Queue.obliterate().then(() => {
          console.log(`Removing job ${entity.name}`);
        });
      });
    },
  };
};

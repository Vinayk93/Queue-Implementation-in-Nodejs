/**
   * Recive a message
   * when get a message append on the file
   * Single customer execution
   * Read the list of the message from pointer to broker
   * and borker execute the message to particular consumer
   * Pointer increment
   * consume call -> function
   * if execute successfully -> ok
   * if not then -> execute again
   * if retry timout put it in DeadLetterQueue
   */
  const MAX_RETRY_COUNT = process.env.MAX_RETRY_COUNT = 3;
  const RETRY_TIMEOUT = process.env.RETRY_TIMEOUT = 1500;
  const SIZE_LIMIT = process.env.SIZE_LIMIT = '100';
  const LOG_FILE_PATH_local= process.env.LOG_FILE_PATH_local = './log/log001.txt';
  
   const fileHelper = require('./filehelper/index');

// list of consumer
const consumer1 = (data) => {
  // success consumer
  console.log('consumer1 processing the data' + data);
  throw new Error('Not able to process');
//   return 1;
};
const consumer2 = (data) => {
  if (data) {
    console.log('consumer2 processing the data' + data);
  }
  throw new Error('Not able to process');
//   return 1;
};
const consumer = [consumer1, consumer2];

function process_the_request (start_line = 1) {
  const queue = [];
  console.log('Execution Start');
  return new Promise((resolve, reject) => {
    fileHelper.read_file(start_line)
      .then((file_read_result) => {
        if (file_read_result.end === true) {
          return 0;
        }
        console.log('Step 1: read File');
        return execute(file_read_result, queue)
          .then(async (s) => {
            console.log('Current Buffer queue', queue);
            return clear_Q(queue);
          });
      })
      .then((s) => {
        if (s === 1) {
          start_line += 1;
          console.log('Execute the next data -------------------------------------------------------->');
        } else {
          console.log('Wait for 1500 for the next cron to check the data');
        }
        return setTimeout(process_the_request, RETRY_TIMEOUT, start_line);
      //   process_the_request(start_line);
      })
      .catch((err)=>{
        console.log(err);
      })
      ;
  });
}

async function clear_Q (queue) {
  while (queue.length > 0) {
    const data = queue.pop();
    await execute(data, queue);
  }
  return 1;
}

async function execute (file_read_result, queue) {
  console.log('Step 2: Consumer start consuming the request');
  const random_select = Math.round(Math.random() * (consumer.length - 1));
  try {
    await consumer[random_select](file_read_result.payload);
  } catch (error) {
    console.log('Error: Error happen when consumer execution ' + (random_select + 1));
    const retry_count = (file_read_result.retry_count + 1) || 1;
    if (retry_count > MAX_RETRY_COUNT) {
      console.log('Too many retry Not able to process');
      await fileHelper.write_file(JSON.stringify(file_read_result), './log/Deadletter001.txt');
    } else {
      console.log('Sending to the retry retry_count = ' + retry_count);
      const file_read_result_to_Q = Object.assign(file_read_result, {retry_count: retry_count});
      queue.push(file_read_result_to_Q);
    }
  }
  return 'sucess';
}

const sendmessage = async (content) => {
  try {
    if (typeof content === 'string') {
      content = JSON.parse(content);
    }
    const content_generator = {
      payload: content
    };
    const response = await fileHelper.write_file(JSON.stringify(content_generator), './log/log001.txt');
    return response;
  } catch (e) {
    console.log('exception occured');
  }
};

module.exports.sendmessage = sendmessage;
module.exports.process_the_request = process_the_request;
// unit test
// sendmessage({a: 2});
// process_the_request(1);

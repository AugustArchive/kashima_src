import pika

class Watcher:
  """ Creates a new `Watcher` instance """
  def __init__(self):
    self.rabbitmq = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    self.channel = self.rabbitmq.channel(channel_number=4)

  def declare_queue(self, queue: str):
    """ Declares a new queue instance """
    self.channel.queue_declare(queue=queue)

  def publish(self, queue: str, body):
    """ Publishes a body to the queue """
    self.channel.basic_publish(exchange='', routing_key=queue, body=body)

  def close(self):
    """ Closes the RabbitMQ connection """
    self.rabbitmq.close(418, 'Watcher has closed')
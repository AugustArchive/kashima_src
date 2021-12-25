from watcher import Watcher
import sys, json

def callback(channel, method, props, body):
  data = json.loads(body)
  print(data)

def main(argv):
  try:
    broker = Watcher()

    print(f'[Watcher] Built watcher instance, using queue name to {argv[0]}')
    broker.declare_queue(queue=argv[0])

    print(f'[Watcher] Queue name is now {argv[0]}, now waiting for messages...')
    broker.channel.basic_consume(queue=argv[0], on_message_callback=callback, auto_ack=True)
    broker.channel.start_consuming()
  except KeyboardInterrupt:
    sys.exit()
  except IndexError:
    print('Missing queue name')

if __name__ == '__main__': main(sys.argv[1:])
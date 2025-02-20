import subprocess
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

def call_grpc(method, data=None):
    """
    Вызов gRPC метода через grpcurl.
    :param method: Имя gRPC метода.
    :param data: Данные для отправки в gRPC запросе (JSON).
    :return: Результат выполнения gRPC запроса.
    """
    try:
        command = [
            "grpcurl",
            "-plaintext",
            "-d", json.dumps(data) if data else "{}",
            "localhost:8080",
            f"world.World/{method}"
        ]
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        return {"error": "gRPC request failed", "details": e.stderr}

@app.route('/world-metadata', methods=['GET'])
def get_metadata():
    """Получение метаданных мира."""
    return jsonify(call_grpc("WorldMetadata"))

@app.route('/subscribe-indexer', methods=['POST'])
def subscribe_indexer():
    """Подписка на обновления индексатора."""
    data = request.get_json()
    return jsonify(call_grpc("SubscribeIndexer", data))

@app.route('/subscribe-models', methods=['POST'])
def subscribe_models():
    """Подписка на обновления моделей."""
    data = request.get_json()
    return jsonify(call_grpc("SubscribeModels", data))

@app.route('/subscribe-entities', methods=['POST'])
def subscribe_entities():
    """Подписка на обновления сущностей."""
    data = request.get_json()
    return jsonify(call_grpc("SubscribeEntities", data))

@app.route('/update-entities-subscription', methods=['POST'])
def update_entities_subscription():
    """Обновление подписки на сущности."""
    data = request.get_json()
    return jsonify(call_grpc("UpdateEntitiesSubscription", data))

@app.route('/retrieve-entities', methods=['POST'])
def retrieve_entities():
    """Получение сущностей."""
    data = request.get_json()
    return jsonify(call_grpc("RetrieveEntities", data))

@app.route('/subscribe-events', methods=['POST'])
def subscribe_events():
    """Подписка на события."""
    data = request.get_json()
    return jsonify(call_grpc("SubscribeEvents", data))

@app.route('/retrieve-events', methods=['POST'])
def retrieve_events():
    """Получение событий."""
    data = request.get_json()
    return jsonify(call_grpc("RetrieveEvents", data))

@app.route('/subscribe-token-balances', methods=['POST'])
def subscribe_token_balances():
    """Подписка на обновления балансов токенов."""
    data = request.get_json()
    return jsonify(call_grpc("SubscribeTokenBalances", data))

@app.route('/update-token-balances-subscription', methods=['POST'])
def update_token_balances_subscription():
    """Обновление подписки на балансы токенов."""
    data = request.get_json()
    return jsonify(call_grpc("UpdateTokenBalancesSubscription", data))

@app.route('/retrieve-tokens', methods=['POST'])
def retrieve_tokens():
    """Получение токенов."""
    data = request.get_json()
    return jsonify(call_grpc("RetrieveTokens", data))

@app.route('/retrieve-token-balances', methods=['POST'])
def retrieve_token_balances():
    """Получение балансов токенов."""
    data = request.get_json()
    return jsonify(call_grpc("RetrieveTokenBalances", data))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
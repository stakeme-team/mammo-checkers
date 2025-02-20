from flask import Flask, jsonify, request
import grpc
import world_pb2
import world_pb2_grpc
import types_pb2
import base64

app = Flask(__name__)

def grpc_call(method_name, request_class, request_data=None):
    try:
        channel = grpc.insecure_channel('localhost:8080')
        stub = world_pb2_grpc.WorldStub(channel)
        if request_data:
            request = request_class(**request_data)
        else:
            request = request_class()
        response = getattr(stub, method_name)(request)
        return response
    except Exception as e:
        return {"error": str(e)}

def convert_to_dict(response):
    if isinstance(response, dict):
        return response
    result = {}
    for field in response.DESCRIPTOR.fields:
        value = getattr(response, field.name)
        if isinstance(value, bytes):
            value = base64.b64encode(value).decode('utf-8')
        elif field.message_type:
            if field.label == field.LABEL_REPEATED:
                result[field.name] = [convert_to_dict(item) for item in value]
            else:
                result[field.name] = convert_to_dict(value)
        else:
            result[field.name] = value
    return result

def register_grpc_route(app, route, grpc_method, request_class, use_request_data=False):
    def grpc_route():
        try:
            if request.method == 'POST' and use_request_data:
                request_data = request.get_json() or {}
                response = grpc_call(grpc_method, request_class, request_data)
            else:
                response = grpc_call(grpc_method, request_class)
            response_dict = convert_to_dict(response)
            return jsonify(response_dict), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    app.add_url_rule(route, endpoint=f"{grpc_method}_route", view_func=grpc_route, methods=['GET', 'POST'])

register_grpc_route(app, '/worldMetadata', 'WorldMetadata', world_pb2.WorldMetadataRequest)
register_grpc_route(app, '/retrieveTokens', 'RetrieveTokens', world_pb2.RetrieveTokensRequest)
register_grpc_route(app, '/retrieveTokenBalances', 'RetrieveTokenBalances', world_pb2.RetrieveTokenBalancesRequest)
register_grpc_route(app, '/subscribeIndexer', 'SubscribeIndexer', world_pb2.SubscribeIndexerRequest)
register_grpc_route(app, '/subscribeModels', 'SubscribeModels', world_pb2.SubscribeModelsRequest, use_request_data=True)
register_grpc_route(app, '/subscribeEntities', 'SubscribeEntities', world_pb2.SubscribeEntitiesRequest, use_request_data=True)
register_grpc_route(app, '/updateEntitiesSubscription', 'UpdateEntitiesSubscription', world_pb2.UpdateEntitiesSubscriptionRequest, use_request_data=True)
register_grpc_route(app, '/retrieveEntities', 'RetrieveEntities', world_pb2.RetrieveEntitiesRequest, use_request_data=True)
register_grpc_route(app, '/retrieveEntitiesStreaming', 'RetrieveEntitiesStreaming', world_pb2.RetrieveEntitiesRequest, use_request_data=True)
register_grpc_route(app, '/subscribeEventMessages', 'SubscribeEventMessages', world_pb2.SubscribeEventMessagesRequest, use_request_data=True)
register_grpc_route(app, '/updateEventMessagesSubscription', 'UpdateEventMessagesSubscription', world_pb2.UpdateEventMessagesSubscriptionRequest, use_request_data=True)
register_grpc_route(app, '/subscribeTokenBalances', 'SubscribeTokenBalances', world_pb2.RetrieveTokenBalancesRequest, use_request_data=True)
register_grpc_route(app, '/updateTokenBalancesSubscription', 'UpdateTokenBalancesSubscription', world_pb2.UpdateTokenBalancesSubscriptionRequest, use_request_data=True)
register_grpc_route(app, '/subscribeTokens', 'SubscribeTokens', world_pb2.RetrieveTokensRequest, use_request_data=True)
register_grpc_route(app, '/updateTokensSubscription', 'UpdateTokensSubscription', world_pb2.UpdateTokenSubscriptionRequest, use_request_data=True)
register_grpc_route(app, '/retrieveEventMessages', 'RetrieveEventMessages', world_pb2.RetrieveEventMessagesRequest, use_request_data=True)
register_grpc_route(app, '/retrieveEvents', 'RetrieveEvents', world_pb2.RetrieveEventsRequest, use_request_data=True)
register_grpc_route(app, '/subscribeEvents', 'SubscribeEvents', world_pb2.SubscribeEventsRequest, use_request_data=True)
register_grpc_route(app, '/retrieveControllers', 'RetrieveControllers', world_pb2.RetrieveControllersRequest, use_request_data=True)

if __name__ == '__main__':
    app.run(debug=True)

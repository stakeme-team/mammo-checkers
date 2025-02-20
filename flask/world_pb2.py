# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: world.proto
# Protobuf Python Version: 5.29.0
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import runtime_version as _runtime_version
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
_runtime_version.ValidateProtobufRuntimeVersion(
    _runtime_version.Domain.PUBLIC,
    5,
    29,
    0,
    '',
    'world.proto'
)
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


import types_pb2 as types__pb2
from google.protobuf import empty_pb2 as google_dot_protobuf_dot_empty__pb2


DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x0bworld.proto\x12\x05world\x1a\x0btypes.proto\x1a\x1bgoogle/protobuf/empty.proto\"8\n\x1aRetrieveControllersRequest\x12\x1a\n\x12\x63ontract_addresses\x18\x01 \x03(\x0c\"E\n\x1bRetrieveControllersResponse\x12&\n\x0b\x63ontrollers\x18\x01 \x03(\x0b\x32\x11.types.Controller\"\x8b\x01\n&UpdateTokenBalancesSubscriptionRequest\x12\x17\n\x0fsubscription_id\x18\x01 \x01(\x04\x12\x1a\n\x12\x63ontract_addresses\x18\x02 \x03(\x0c\x12\x19\n\x11\x61\x63\x63ount_addresses\x18\x03 \x03(\x0c\x12\x11\n\ttoken_ids\x18\x04 \x03(\x0c\"_\n\x1eSubscribeTokenBalancesResponse\x12\x17\n\x0fsubscription_id\x18\x01 \x01(\x04\x12$\n\x07\x62\x61lance\x18\x02 \x01(\x0b\x32\x13.types.TokenBalance\"F\n\x15RetrieveTokensRequest\x12\x1a\n\x12\x63ontract_addresses\x18\x01 \x03(\x0c\x12\x11\n\ttoken_ids\x18\x02 \x03(\x0c\"6\n\x16RetrieveTokensResponse\x12\x1c\n\x06tokens\x18\x01 \x03(\x0b\x32\x0c.types.Token\"O\n\x17SubscribeTokensResponse\x12\x17\n\x0fsubscription_id\x18\x01 \x01(\x04\x12\x1b\n\x05token\x18\x02 \x01(\x0b\x32\x0c.types.Token\"h\n\x1eUpdateTokenSubscriptionRequest\x12\x17\n\x0fsubscription_id\x18\x01 \x01(\x04\x12\x1a\n\x12\x63ontract_addresses\x18\x02 \x03(\x0c\x12\x11\n\ttoken_ids\x18\x03 \x03(\x0c\"h\n\x1cRetrieveTokenBalancesRequest\x12\x19\n\x11\x61\x63\x63ount_addresses\x18\x01 \x03(\x0c\x12\x1a\n\x12\x63ontract_addresses\x18\x02 \x03(\x0c\x12\x11\n\ttoken_ids\x18\x03 \x03(\x0c\"F\n\x1dRetrieveTokenBalancesResponse\x12%\n\x08\x62\x61lances\x18\x01 \x03(\x0b\x32\x13.types.TokenBalance\"3\n\x17SubscribeIndexerRequest\x12\x18\n\x10\x63ontract_address\x18\x01 \x01(\x0c\"m\n\x18SubscribeIndexerResponse\x12\x0c\n\x04head\x18\x01 \x01(\x03\x12\x0b\n\x03tps\x18\x02 \x01(\x03\x12\x1c\n\x14last_block_timestamp\x18\x03 \x01(\x03\x12\x18\n\x10\x63ontract_address\x18\x04 \x01(\x0c\"\x16\n\x14WorldMetadataRequest\"?\n\x15WorldMetadataResponse\x12&\n\x08metadata\x18\x01 \x01(\x0b\x32\x14.types.WorldMetadata\"E\n\x16SubscribeModelsRequest\x12+\n\x0bmodels_keys\x18\x01 \x03(\x0b\x32\x16.types.ModelKeysClause\"C\n\x17SubscribeModelsResponse\x12(\n\x0cmodel_update\x18\x01 \x01(\x0b\x32\x12.types.ModelUpdate\"D\n\x18SubscribeEntitiesRequest\x12(\n\x07\x63lauses\x18\x01 \x03(\x0b\x32\x17.types.EntityKeysClause\"]\n\x1dSubscribeEventMessagesRequest\x12(\n\x07\x63lauses\x18\x01 \x03(\x0b\x32\x17.types.EntityKeysClause\x12\x12\n\nhistorical\x18\x02 \x01(\x08\"f\n!UpdateEntitiesSubscriptionRequest\x12\x17\n\x0fsubscription_id\x18\x01 \x01(\x04\x12(\n\x07\x63lauses\x18\x02 \x03(\x0b\x32\x17.types.EntityKeysClause\"\x7f\n&UpdateEventMessagesSubscriptionRequest\x12\x17\n\x0fsubscription_id\x18\x01 \x01(\x04\x12(\n\x07\x63lauses\x18\x02 \x03(\x0b\x32\x17.types.EntityKeysClause\x12\x12\n\nhistorical\x18\x03 \x01(\x08\"Q\n\x17SubscribeEntityResponse\x12\x1d\n\x06\x65ntity\x18\x01 \x01(\x0b\x32\r.types.Entity\x12\x17\n\x0fsubscription_id\x18\x02 \x01(\x04\"6\n\x17RetrieveEntitiesRequest\x12\x1b\n\x05query\x18\x01 \x01(\x0b\x32\x0c.types.Query\"O\n\x1cRetrieveEventMessagesRequest\x12\x1b\n\x05query\x18\x01 \x01(\x0b\x32\x0c.types.Query\x12\x12\n\nhistorical\x18\x02 \x01(\x08\"P\n\x18RetrieveEntitiesResponse\x12\x1f\n\x08\x65ntities\x18\x01 \x03(\x0b\x32\r.types.Entity\x12\x13\n\x0btotal_count\x18\x02 \x01(\r\"[\n!RetrieveEntitiesStreamingResponse\x12\x1d\n\x06\x65ntity\x18\x01 \x01(\x0b\x32\r.types.Entity\x12\x17\n\x0fremaining_count\x18\x02 \x01(\r\"9\n\x15RetrieveEventsRequest\x12 \n\x05query\x18\x01 \x01(\x0b\x32\x11.types.EventQuery\"6\n\x16RetrieveEventsResponse\x12\x1c\n\x06\x65vents\x18\x01 \x03(\x0b\x32\x0c.types.Event\"?\n\x16SubscribeEventsRequest\x12%\n\x04keys\x18\x01 \x03(\x0b\x32\x17.types.EntityKeysClause\"6\n\x17SubscribeEventsResponse\x12\x1b\n\x05\x65vent\x18\x01 \x01(\x0b\x32\x0c.types.Event2\xd3\r\n\x05World\x12U\n\x10SubscribeIndexer\x12\x1e.world.SubscribeIndexerRequest\x1a\x1f.world.SubscribeIndexerResponse0\x01\x12J\n\rWorldMetadata\x12\x1b.world.WorldMetadataRequest\x1a\x1c.world.WorldMetadataResponse\x12R\n\x0fSubscribeModels\x12\x1d.world.SubscribeModelsRequest\x1a\x1e.world.SubscribeModelsResponse0\x01\x12V\n\x11SubscribeEntities\x12\x1f.world.SubscribeEntitiesRequest\x1a\x1e.world.SubscribeEntityResponse0\x01\x12^\n\x1aUpdateEntitiesSubscription\x12(.world.UpdateEntitiesSubscriptionRequest\x1a\x16.google.protobuf.Empty\x12S\n\x10RetrieveEntities\x12\x1e.world.RetrieveEntitiesRequest\x1a\x1f.world.RetrieveEntitiesResponse\x12g\n\x19RetrieveEntitiesStreaming\x12\x1e.world.RetrieveEntitiesRequest\x1a(.world.RetrieveEntitiesStreamingResponse0\x01\x12`\n\x16SubscribeEventMessages\x12$.world.SubscribeEventMessagesRequest\x1a\x1e.world.SubscribeEntityResponse0\x01\x12h\n\x1fUpdateEventMessagesSubscription\x12-.world.UpdateEventMessagesSubscriptionRequest\x1a\x16.google.protobuf.Empty\x12\x66\n\x16SubscribeTokenBalances\x12#.world.RetrieveTokenBalancesRequest\x1a%.world.SubscribeTokenBalancesResponse0\x01\x12h\n\x1fUpdateTokenBalancesSubscription\x12-.world.UpdateTokenBalancesSubscriptionRequest\x1a\x16.google.protobuf.Empty\x12Q\n\x0fSubscribeTokens\x12\x1c.world.RetrieveTokensRequest\x1a\x1e.world.SubscribeTokensResponse0\x01\x12Y\n\x18UpdateTokensSubscription\x12%.world.UpdateTokenSubscriptionRequest\x1a\x16.google.protobuf.Empty\x12]\n\x15RetrieveEventMessages\x12#.world.RetrieveEventMessagesRequest\x1a\x1f.world.RetrieveEntitiesResponse\x12M\n\x0eRetrieveEvents\x12\x1c.world.RetrieveEventsRequest\x1a\x1d.world.RetrieveEventsResponse\x12R\n\x0fSubscribeEvents\x12\x1d.world.SubscribeEventsRequest\x1a\x1e.world.SubscribeEventsResponse0\x01\x12M\n\x0eRetrieveTokens\x12\x1c.world.RetrieveTokensRequest\x1a\x1d.world.RetrieveTokensResponse\x12\x62\n\x15RetrieveTokenBalances\x12#.world.RetrieveTokenBalancesRequest\x1a$.world.RetrieveTokenBalancesResponse\x12\\\n\x13RetrieveControllers\x12!.world.RetrieveControllersRequest\x1a\".world.RetrieveControllersResponseb\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'world_pb2', _globals)
if not _descriptor._USE_C_DESCRIPTORS:
  DESCRIPTOR._loaded_options = None
  _globals['_RETRIEVECONTROLLERSREQUEST']._serialized_start=64
  _globals['_RETRIEVECONTROLLERSREQUEST']._serialized_end=120
  _globals['_RETRIEVECONTROLLERSRESPONSE']._serialized_start=122
  _globals['_RETRIEVECONTROLLERSRESPONSE']._serialized_end=191
  _globals['_UPDATETOKENBALANCESSUBSCRIPTIONREQUEST']._serialized_start=194
  _globals['_UPDATETOKENBALANCESSUBSCRIPTIONREQUEST']._serialized_end=333
  _globals['_SUBSCRIBETOKENBALANCESRESPONSE']._serialized_start=335
  _globals['_SUBSCRIBETOKENBALANCESRESPONSE']._serialized_end=430
  _globals['_RETRIEVETOKENSREQUEST']._serialized_start=432
  _globals['_RETRIEVETOKENSREQUEST']._serialized_end=502
  _globals['_RETRIEVETOKENSRESPONSE']._serialized_start=504
  _globals['_RETRIEVETOKENSRESPONSE']._serialized_end=558
  _globals['_SUBSCRIBETOKENSRESPONSE']._serialized_start=560
  _globals['_SUBSCRIBETOKENSRESPONSE']._serialized_end=639
  _globals['_UPDATETOKENSUBSCRIPTIONREQUEST']._serialized_start=641
  _globals['_UPDATETOKENSUBSCRIPTIONREQUEST']._serialized_end=745
  _globals['_RETRIEVETOKENBALANCESREQUEST']._serialized_start=747
  _globals['_RETRIEVETOKENBALANCESREQUEST']._serialized_end=851
  _globals['_RETRIEVETOKENBALANCESRESPONSE']._serialized_start=853
  _globals['_RETRIEVETOKENBALANCESRESPONSE']._serialized_end=923
  _globals['_SUBSCRIBEINDEXERREQUEST']._serialized_start=925
  _globals['_SUBSCRIBEINDEXERREQUEST']._serialized_end=976
  _globals['_SUBSCRIBEINDEXERRESPONSE']._serialized_start=978
  _globals['_SUBSCRIBEINDEXERRESPONSE']._serialized_end=1087
  _globals['_WORLDMETADATAREQUEST']._serialized_start=1089
  _globals['_WORLDMETADATAREQUEST']._serialized_end=1111
  _globals['_WORLDMETADATARESPONSE']._serialized_start=1113
  _globals['_WORLDMETADATARESPONSE']._serialized_end=1176
  _globals['_SUBSCRIBEMODELSREQUEST']._serialized_start=1178
  _globals['_SUBSCRIBEMODELSREQUEST']._serialized_end=1247
  _globals['_SUBSCRIBEMODELSRESPONSE']._serialized_start=1249
  _globals['_SUBSCRIBEMODELSRESPONSE']._serialized_end=1316
  _globals['_SUBSCRIBEENTITIESREQUEST']._serialized_start=1318
  _globals['_SUBSCRIBEENTITIESREQUEST']._serialized_end=1386
  _globals['_SUBSCRIBEEVENTMESSAGESREQUEST']._serialized_start=1388
  _globals['_SUBSCRIBEEVENTMESSAGESREQUEST']._serialized_end=1481
  _globals['_UPDATEENTITIESSUBSCRIPTIONREQUEST']._serialized_start=1483
  _globals['_UPDATEENTITIESSUBSCRIPTIONREQUEST']._serialized_end=1585
  _globals['_UPDATEEVENTMESSAGESSUBSCRIPTIONREQUEST']._serialized_start=1587
  _globals['_UPDATEEVENTMESSAGESSUBSCRIPTIONREQUEST']._serialized_end=1714
  _globals['_SUBSCRIBEENTITYRESPONSE']._serialized_start=1716
  _globals['_SUBSCRIBEENTITYRESPONSE']._serialized_end=1797
  _globals['_RETRIEVEENTITIESREQUEST']._serialized_start=1799
  _globals['_RETRIEVEENTITIESREQUEST']._serialized_end=1853
  _globals['_RETRIEVEEVENTMESSAGESREQUEST']._serialized_start=1855
  _globals['_RETRIEVEEVENTMESSAGESREQUEST']._serialized_end=1934
  _globals['_RETRIEVEENTITIESRESPONSE']._serialized_start=1936
  _globals['_RETRIEVEENTITIESRESPONSE']._serialized_end=2016
  _globals['_RETRIEVEENTITIESSTREAMINGRESPONSE']._serialized_start=2018
  _globals['_RETRIEVEENTITIESSTREAMINGRESPONSE']._serialized_end=2109
  _globals['_RETRIEVEEVENTSREQUEST']._serialized_start=2111
  _globals['_RETRIEVEEVENTSREQUEST']._serialized_end=2168
  _globals['_RETRIEVEEVENTSRESPONSE']._serialized_start=2170
  _globals['_RETRIEVEEVENTSRESPONSE']._serialized_end=2224
  _globals['_SUBSCRIBEEVENTSREQUEST']._serialized_start=2226
  _globals['_SUBSCRIBEEVENTSREQUEST']._serialized_end=2289
  _globals['_SUBSCRIBEEVENTSRESPONSE']._serialized_start=2291
  _globals['_SUBSCRIBEEVENTSRESPONSE']._serialized_end=2345
  _globals['_WORLD']._serialized_start=2348
  _globals['_WORLD']._serialized_end=4095
# @@protoc_insertion_point(module_scope)

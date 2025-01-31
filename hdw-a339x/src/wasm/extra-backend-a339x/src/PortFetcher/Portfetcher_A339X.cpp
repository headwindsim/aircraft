#include "Portfetcher_A339X.h"
#include <iostream>

bool PortFetcher::initialize() {
  last_value = 0;
  dataManager = &msfsHandler.getDataManager();
  portVar = dataManager->make_clientdataarea_var<uint16_t>("HDW_TRAFFIC_PORT");
  portVar->setSkipChangeCheck(true);
  var = dataManager->make_named_var("A339X_TRAFFIC_PORT", UNITS.Number, UpdateMode::NO_AUTO_UPDATE, 0, 0);
  portVar->addCallback([&]() {
    uint16_t port = portVar->data();
    if(port != last_value)
      var->setAndWriteToSim((double)port);
    last_value = port;
  });
  if (!portVar->requestPeriodicDataFromSim(SIMCONNECT_CLIENT_DATA_PERIOD_ON_SET)) {
    return false;
  }
  return true;
}
bool PortFetcher::update(sGaugeDrawData* pData) {
  return true;
}
bool PortFetcher::shutdown() {
  return true;
}
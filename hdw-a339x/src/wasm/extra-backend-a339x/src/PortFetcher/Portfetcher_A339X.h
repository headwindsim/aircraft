#ifndef FLYBYWIRE_AIRCRAFT_PORTFETCHER_A339X_H
#define FLYBYWIRE_AIRCRAFT_PORTFETCHER_A339X_H

#include <MSFS/MSFS.h>
#include "Module.h"
#include "LocalVariable.h"


class PortFetcher : public Module {
 public:
  PortFetcher() = delete;
  PortFetcher(MsfsHandler& handler) : Module(handler) {
  
   }
protected:


  bool initialize() override;
  bool preUpdate([[maybe_unused]] sGaugeDrawData* pData) override { return true; };  // not required for this module
  bool update(sGaugeDrawData* pData) override;
  bool postUpdate([[maybe_unused]] sGaugeDrawData* pData) override { return true; };  // not required for this module
  bool shutdown() override;
private:
  ClientDataAreaVariablePtr<uint16_t> portVar;
  uint16_t last_value;
  NamedVariablePtr var;
  DataManager* dataManager = nullptr;
};

#endif
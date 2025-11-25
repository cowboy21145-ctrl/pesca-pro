import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { pondAPI, zoneAPI, areaAPI } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  MapPinIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const PondManager = () => {
  const { id: tournamentId } = useParams();
  const navigate = useNavigate();
  
  const [ponds, setPonds] = useState([]);
  const [selectedPond, setSelectedPond] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Forms
  const [showPondForm, setShowPondForm] = useState(false);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [showAreaForm, setShowAreaForm] = useState(false);
  
  const [pondForm, setPondForm] = useState({ pond_name: '', description: '' });
  const [zoneForm, setZoneForm] = useState({ zone_name: '', zone_number: '', color: '#3B82F6' });
  const [areaForm, setAreaForm] = useState({ start_number: 1, count: 10, price: 0 });
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  
  // Delete confirmation modals
  const [showDeletePondModal, setShowDeletePondModal] = useState(false);
  const [showDeleteZoneModal, setShowDeleteZoneModal] = useState(false);
  const [showDeleteAreaModal, setShowDeleteAreaModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchPonds();
  }, [tournamentId]);

  const fetchPonds = async () => {
    try {
      const response = await pondAPI.getByTournament(tournamentId);
      setPonds(response.data);
      if (response.data.length > 0 && !selectedPond) {
        fetchPondDetails(response.data[0].pond_id);
      }
    } catch (error) {
      console.error('Error fetching ponds:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPondDetails = async (pondId) => {
    try {
      const response = await pondAPI.getFull(pondId);
      setSelectedPond(response.data);
    } catch (error) {
      console.error('Error fetching pond details:', error);
    }
  };

  const createPond = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('tournament_id', tournamentId);
      formData.append('pond_name', pondForm.pond_name);
      formData.append('description', pondForm.description);
      
      await pondAPI.create(formData);
      toast.success('Pond created!');
      setShowPondForm(false);
      setPondForm({ pond_name: '', description: '' });
      fetchPonds();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create pond');
    }
  };

  const handleDeletePond = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      await pondAPI.delete(itemToDelete);
      toast.success('Pond deleted!');
      setSelectedPond(null);
      fetchPonds();
      setShowDeletePondModal(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error('Failed to delete pond');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeletePondModal = (pondId) => {
    setItemToDelete(pondId);
    setShowDeletePondModal(true);
  };

  const createZone = async (e) => {
    e.preventDefault();
    if (!selectedPond) return;
    
    try {
      await zoneAPI.create({
        pond_id: selectedPond.pond_id,
        zone_name: zoneForm.zone_name,
        zone_number: parseInt(zoneForm.zone_number),
        color: zoneForm.color
      });
      toast.success('Zone created!');
      setShowZoneForm(false);
      setZoneForm({ zone_name: '', zone_number: '', color: '#3B82F6' });
      fetchPondDetails(selectedPond.pond_id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create zone');
    }
  };

  const handleDeleteZone = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      await zoneAPI.delete(itemToDelete);
      toast.success('Zone deleted!');
      fetchPondDetails(selectedPond.pond_id);
      setShowDeleteZoneModal(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error('Failed to delete zone');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteZoneModal = (zoneId) => {
    setItemToDelete(zoneId);
    setShowDeleteZoneModal(true);
  };

  const createAreas = async (e) => {
    e.preventDefault();
    if (!selectedZoneId) return;
    
    try {
      const areas = [];
      for (let i = 0; i < parseInt(areaForm.count); i++) {
        areas.push({
          area_number: parseInt(areaForm.start_number) + i,
          price: parseFloat(areaForm.price)
        });
      }
      
      await areaAPI.bulkCreate({
        zone_id: selectedZoneId,
        areas
      });
      
      toast.success(`${areaForm.count} areas created!`);
      setShowAreaForm(false);
      setAreaForm({ start_number: 1, count: 10, price: 0 });
      setSelectedZoneId(null);
      fetchPondDetails(selectedPond.pond_id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create areas');
    }
  };

  const handleDeleteArea = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      await areaAPI.delete(itemToDelete);
      toast.success('Area deleted!');
      fetchPondDetails(selectedPond.pond_id);
      setShowDeleteAreaModal(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error('Failed to delete area');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteAreaModal = (areaId) => {
    setItemToDelete(areaId);
    setShowDeleteAreaModal(true);
  };

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-ocean-500/30 border-t-ocean-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/organizer/tournaments/${tournamentId}`)}
        className="flex items-center gap-2 text-slate-600 hover:text-forest-600 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Back to Tournament</span>
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pond Manager</h1>
          <p className="text-slate-500">Configure fishing ponds, zones, and areas</p>
        </div>
        <button
          onClick={() => setShowPondForm(true)}
          className="btn-success flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Pond
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Pond List */}
        <div className="card p-4">
          <h3 className="font-semibold text-slate-800 mb-3">Ponds</h3>
          {ponds.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No ponds yet</p>
          ) : (
            <div className="space-y-2">
              {ponds.map((pond) => (
                <button
                  key={pond.pond_id}
                  onClick={() => fetchPondDetails(pond.pond_id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedPond?.pond_id === pond.pond_id
                      ? 'bg-forest-100 text-forest-800'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <p className="font-medium">{pond.pond_name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {pond.zone_count || 0} zones • {pond.area_count || 0} areas
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pond Details */}
        <div className="lg:col-span-3">
          {selectedPond ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedPond.pond_name}</h2>
                  {selectedPond.description && (
                    <p className="text-slate-500 text-sm mt-1">{selectedPond.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowZoneForm(true)}
                    className="btn-primary text-sm py-2"
                  >
                    <PlusIcon className="w-4 h-4 mr-1 inline" />
                    Add Zone
                  </button>
                  <button
                    onClick={() => openDeletePondModal(selectedPond.pond_id)}
                    className="btn-danger text-sm py-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Zones */}
              {selectedPond.zones?.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                  <MapPinIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500">No zones yet. Add zones to start configuring areas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPond.zones?.map((zone) => (
                    <div key={zone.zone_id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div 
                        className="p-4 flex items-center justify-between"
                        style={{ backgroundColor: `${zone.color}15` }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: zone.color }}
                          >
                            {zone.zone_number}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{zone.zone_name}</p>
                            <p className="text-xs text-slate-500">{zone.areas?.length || 0} areas</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedZoneId(zone.zone_id);
                              setShowAreaForm(true);
                            }}
                            className="px-3 py-1 text-sm bg-white rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4 inline mr-1" />
                            Areas
                          </button>
                          <button
                            onClick={() => openDeleteZoneModal(zone.zone_id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Areas Grid */}
                      {zone.areas?.length > 0 && (
                        <div className="p-4 bg-slate-50 border-t border-slate-200">
                          <div className="flex flex-wrap gap-2">
                            {zone.areas.map((area) => (
                              <div
                                key={area.area_id}
                                className={`group relative w-16 h-16 rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all cursor-default ${
                                  area.is_available
                                    ? 'bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300'
                                    : 'bg-slate-300 text-slate-500'
                                }`}
                              >
                                <span className="font-bold">{area.area_number}</span>
                                <span className="text-xs text-slate-500">
                                  {parseFloat(area.price).toLocaleString()}
                                </span>
                                <button
                                  onClick={() => openDeleteAreaModal(area.area_id)}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <TrashIcon className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="card p-12 text-center">
              <MapPinIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Select a Pond</h3>
              <p className="text-slate-500">Choose a pond from the list or create a new one</p>
            </div>
          )}
        </div>
      </div>

      {/* Pond Form Modal */}
      {showPondForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Pond</h3>
            <form onSubmit={createPond} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pond Name</label>
                <input
                  type="text"
                  value={pondForm.pond_name}
                  onChange={(e) => setPondForm({ ...pondForm, pond_name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Main Pond"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={pondForm.description}
                  onChange={(e) => setPondForm({ ...pondForm, description: e.target.value })}
                  className="input-field"
                  rows="2"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowPondForm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-success flex-1">
                  Create Pond
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Zone Form Modal */}
      {showZoneForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Zone</h3>
            <form onSubmit={createZone} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Zone Name</label>
                <input
                  type="text"
                  value={zoneForm.zone_name}
                  onChange={(e) => setZoneForm({ ...zoneForm, zone_name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Zone A"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Zone Number</label>
                <input
                  type="number"
                  value={zoneForm.zone_number}
                  onChange={(e) => setZoneForm({ ...zoneForm, zone_number: e.target.value })}
                  className="input-field"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setZoneForm({ ...zoneForm, color })}
                      className={`w-8 h-8 rounded-lg transition-transform ${
                        zoneForm.color === color ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowZoneForm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-success flex-1">
                  Create Zone
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Area Form Modal */}
      {showAreaForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-4">Add Areas</h3>
            <form onSubmit={createAreas} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Starting Number</label>
                <input
                  type="number"
                  value={areaForm.start_number}
                  onChange={(e) => setAreaForm({ ...areaForm, start_number: e.target.value })}
                  className="input-field"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Number of Areas</label>
                <input
                  type="number"
                  value={areaForm.count}
                  onChange={(e) => setAreaForm({ ...areaForm, count: e.target.value })}
                  className="input-field"
                  min="1"
                  max="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price per Area</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">RM</span>
                  <input
                    type="number"
                    value={areaForm.price}
                    onChange={(e) => setAreaForm({ ...areaForm, price: e.target.value })}
                    className="input-field pl-12"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAreaForm(false);
                    setSelectedZoneId(null);
                  }} 
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-success flex-1">
                  Create Areas
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Pond Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeletePondModal}
        onClose={() => {
          setShowDeletePondModal(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeletePond}
        title="Delete Pond"
        message="Are you sure you want to delete this pond? All zones and areas within this pond will also be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />

      {/* Delete Zone Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteZoneModal}
        onClose={() => {
          setShowDeleteZoneModal(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteZone}
        title="Delete Zone"
        message="Are you sure you want to delete this zone? All areas within this zone will also be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />

      {/* Delete Area Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteAreaModal}
        onClose={() => {
          setShowDeleteAreaModal(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteArea}
        title="Delete Area"
        message="Are you sure you want to delete this area? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default PondManager;


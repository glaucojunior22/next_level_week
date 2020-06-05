import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import './styles.css';
import logo from '../../assets/logo.svg';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import Dropzone from '../../components/Dropzone';
import api from '../../services/api';
import ibge from '../../services/ibge';


// Estado de arrays e objetos precisam ter seu tipo declarado
interface Item {
  id: number;
  name: string;
  image_url: string
}

interface IBGEUFResponse{
  sigla: string;
}

interface IBGECityResponse{
  nome: string;
}

const CreatePoint = () => {
  const [items, setitems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
  
  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });

  const history = useHistory();

  function handleMapClick(event: LeafletMouseEvent){
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    })
  }

  function handleSelectUf(event:ChangeEvent<HTMLSelectElement>){
    setSelectedUf(event.target.value);
  }
  
  function handleSelectCity(event:ChangeEvent<HTMLSelectElement>){
    setSelectedCity(event.target.value);
  }

  function handleSelectItem(id: number){
    const alreadySelected = selectedItems.findIndex(item => item === id);
    if ( alreadySelected >= 0 ){
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);
    }else{
      setSelectedItems([...selectedItems, id]);
    }
  }

  async function handleSubmit(event: FormEvent){
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;
    // data no formato json
    // const data = {
    //   name,
    //   email,
    //   whatsapp,
    //   uf,
    //   city,
    //   latitude,
    //   longitude,
    //   items
    // };
    const data = new FormData();
    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));
    if (selectedFile){
      data.append('image', selectedFile);
    }


    await api.post('points', data);

    history.push('/');

  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      setInitialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get('items').then(response => {
      setitems(response.data);
    });
  }, []);

  useEffect(() => {
    ibge.get<IBGEUFResponse[]>('estados').then(response => {
      const ufInitials = response.data.map(uf => uf.sigla);
      setUfs(ufInitials);
    });
  }, []);

  //Carrega as cidades quando o usuário selecionar o estado
  useEffect(() => {
    if (selectedUf === '0'){
      return;
    }
    ibge.get<IBGECityResponse[]>(`estados/${selectedUf}/municipios`).then(response =>{
      const cityNames = response.data.map(city => city.nome);
      setCities(cityNames);
  });
  }, [selectedUf]);

  return(
    <div id="page-create-point">
      <header>
        <img src={ logo } alt="logo"/>

        <Link to="/">
          <FiArrowLeft />
          Voltar para Home
        </Link>
      </header>

      <form onSubmit={ handleSubmit }>
        <h1>Cadastro do ponto de coleta</h1>
        
        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input type="text" name="name" id="name" onChange={handleInputChange}/>
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input type="text" name="email" id="email" onChange={handleInputChange}/>
            </div>
            <div className="field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange}/>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>
          <Map center={ initialPosition } zoom={15} onClick={handleMapClick}>
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            />

            <Marker position={ selectedPosition } />
          </Map>
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                <option value="0">Selecione um Estado</option>
                { ufs.map(uf => (
                  <option key={ uf } value={ uf }>{ uf }</option>
                )) }
              </select>
            </div>

            <div className="field">
              <label htmlFor="cidade">Cidade</label>
              <select name="cidade" id="cidade" value={selectedCity} onChange={handleSelectCity}>
                <option value="0">Selecione uma Cidade</option>
                { cities.map(city => (
                  <option key={ city } value={ city }>{ city }</option>
                )) }
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Items de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>

            <ul className="items-grid">
              { items.map(item => (
                <li 
                  key={ item.id }
                  onClick={() => handleSelectItem(item.id)}
                  className={selectedItems.includes(item.id) ? 'selected' : ''}
                >
                  <img src={ item.image_url } alt={ item.name }/>
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          </legend>
        </fieldset>
        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
}

export default CreatePoint;
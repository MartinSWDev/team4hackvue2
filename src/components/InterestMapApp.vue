<template>
  <div class="min-h-screen p-4" :class="{ 'dislike-effect': showDislikeEffect }">
    <div v-if="step < questions.length">
      <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div class="p-8">
          <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">{{ questions[step].text }}</div>
          <input
            class="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="text"
            :placeholder="'Your answer'"
            v-model="answers[questions[step].key]"
          >
          <button
            class="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            @click="handleNext"
          >
            {{ step < questions.length - 1 ? 'Next' : 'Generate Map' }}
          </button>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="flex flex-col md:flex-row w-full max-w-6xl mx-auto p-4 gap-4">
        <div class="w-full md:w-2/3 h-[600px]">
          <l-map ref="map" v-model="zoom" v-model:zoom="zoom" :center="mapCenter">
            <l-tile-layer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              layer-type="base"
              name="OpenStreetMap"
            ></l-tile-layer>
            <l-marker v-for="place in places" :key="place.id" :lat-lng="place.location" :icon="createIcon(place)">
              <l-tooltip :options="{ permanent: true, interactive: true }">
                <div class="custom-marker">
                  <h3>{{ place.name }}</h3>
                  <p>{{ place.type }}</p>
                </div>
              </l-tooltip>
            </l-marker>
          </l-map>
        </div>
        <div class="w-full md:w-1/3 space-y-4">
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Your Interests</h3>
            </div>
            <div class="border-t border-gray-200">
              <dl>
                <div v-for="(answer, key) in answers" :key="key" class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">{{ key }}</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ answer }}</dd>
                </div>
              </dl>
            </div>
          </div>
          <div v-for="place in places" :key="place.id" class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900">{{ place.name }}</h3>
            </div>
            <div class="border-t border-gray-200">
              <dl>
                <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Type</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ place.type }}</dd>
                </div>
              </dl>
            </div>
            <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button @click="ratePlace(place.id, 'up')" class="mr-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                👍 Like
              </button>
              <button @click="ratePlace(place.id, 'down')" class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                👎 Dislike
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import "leaflet/dist/leaflet.css"
import L from "leaflet";
import { LMap, LTileLayer, LMarker, LTooltip } from "@vue-leaflet/vue-leaflet";
import confetti from 'canvas-confetti';

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LTooltip
  },
  setup() {
    const step = ref(0)
    const answers = reactive({
      food: '',
      music: '',
      city: ''
    })
    const mapCenter = ref([51.505, -0.09])
    const zoom = ref(13)
    const places = ref([])
    const showDislikeEffect = ref(false)

    const questions = [
      { key: 'food', text: 'What food do you like?' },
      { key: 'music', text: 'What music do you like?' },
      { key: 'city', text: 'What city are you in?' }
    ]

    const handleNext = () => {
      if (step.value < questions.length - 1) {
        step.value++
      } else {
        getPlaces()
      }
    }

    const getPlaces = async () => {
      const apiKey = ''; // Replace with your actual API key
      const baseUrl = 'http://localhost:3000/api/places';

      try {
        const response = await fetch(`${baseUrl}?query=${encodeURIComponent(answers.food + ' ' + answers.music + ' in ' + answers.city)}&key=${apiKey}`);
        const data = await response.json();

        if (data.status === 'OK') {
          places.value = data.results.slice(0, 3).map((place, index) => ({
            id: index + 1,
            name: place.name,
            type: 'Place',
            location: [place.geometry.location.lat, place.geometry.location.lng]
          }));

          // Set map center to the first result
          if (places.value.length > 0) {
            mapCenter.value = places.value[0].location;
          }

          step.value++;
        } else {
          console.error('Error fetching places:', data.status);
        }
      } catch (error) {
        console.error('Error fetching places:', error);
      }
    }

    const generateMap = (places) => {
      // Here you would implement logic to determine map center and places based on answers
      // For now, we'll just set a random location and mock places
      mapCenter.value = [51.505, -0.09]
      places.value = [
        { id: 1, name: 'Delicious Restaurant', type: 'Food', location: [51.505, -0.09] },
        { id: 2, name: 'Cool Music Venue', type: 'Music', location: [51.51, -0.1] },
        { id: 3, name: 'Relaxing Park', type: 'Activity', location: [51.515, -0.095] },
      ]
      step.value++
    }

    const createIcon = (place) => {
      return L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="marker-pin">
            <span>${place.name[0]}</span>
          </div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
      });
    }

    const ratePlace = (placeId, rating) => {
      const place = places.value.find(p => p.id === placeId);
      if (place) {
        if (rating === 'up') {
          place.rating = 'liked';
          triggerConfetti();
        } else if (rating === 'down') {
          place.rating = 'disliked';
          triggerDislikeEffect();
        }
      }
    }

    const triggerConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    const triggerDislikeEffect = () => {
      showDislikeEffect.value = true;
      setTimeout(() => {
        showDislikeEffect.value = false;
      }, 500); // Reset after 500ms
    }

    return {
      step,
      answers,
      mapCenter,
      zoom,
      places,
      questions,
      handleNext,
      createIcon,
      ratePlace,
      showDislikeEffect
    }
  }
}
</script>

<style scoped>
@import "leaflet/dist/leaflet.css";

.custom-marker {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  min-width: 150px;
}

.custom-marker h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.custom-marker p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.marker-pin {
  width: 30px;
  height: 30px;
  border-radius: 50% 50% 50% 0;
  background: #c30b82;
  position: absolute;
  transform: rotate(-45deg);
  left: 50%;
  top: 50%;
  margin: -15px 0 0 -15px;
}

.marker-pin::after {
  content: '';
  width: 24px;
  height: 24px;
  margin: 3px 0 0 3px;
  background: #fff;
  position: absolute;
  border-radius: 50%;
}

.marker-pin span {
  width: 22px;
  font-size: 14px;
  font-weight: bold;
  color: #c30b82;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  line-height: 30px;
  transform: rotate(45deg);
}

.dislike-effect {
  background-color: rgba(255, 0, 0, 0.2);
  transition: background-color 0.3s ease;
}
</style>

import { messages } from './messages'
import axios from 'axios'

async function main() {
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i]
        let endpoint = 'shipments'
        if (message.type === 'ORGANIZATION') {
            endpoint = 'organizations'
        }

        try {
            await axios.post(`http://localhost:3000/${endpoint}`, message)
        } catch (error) {
            console.error(error.message, error.response.data)
        }
    }
}

main()
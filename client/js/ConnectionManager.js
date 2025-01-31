/**
 * Created by Peter Stanko on 9/7/15.
 */

function ConnectionManager(host)
{
        var _this = this;

        this.wsocket = new WebSocket(host);
        this.log = Logger;
        this.sum = 0;

        /**
         * When tile is received - must be implemented
         * @type {null} - requires implementation
         */
        this.receivedTile = null;
        /**
         * When tiles are received - must be implemented
         * @type {null}
         */
        this.receivedTiles = null;

        /**
         * When the connection is established
         */
        this.wsocket.onopen = function ()
        {
                _this.log.info("[INFO] WebSocket connected to remote host [%s] ", host);
                window.icfg.status = 1;
                window.stat.updateConnectionStatus(1);
        };

        /**
         * When the message arrives
         * @param event - event - message holder, data in event.data.
         */
        this.wsocket.onmessage = function (event)
        {
                var message = JSON.parse(event.data);

                if(message.type == "tile-int") {
                        var len = event.data.length ;
                        _this.sum += len;
                        _this.log.debug("[DEBUG] Size of incoming message:[%f KB] - {%s} - (%d) [%d, %d] ", len / 1000, message.type, message.level, message.beg, message.end);
                        _this.log.debug("[DEBUG] Total size of messages: [%d KB] or [%f MB]", _this.sum / 1000, _this.sum/ 1000000);
                }

                switch (message.type) {
                        case "tile":
                                _this.receivedTile(message);
                                break;

                        case "tile-int":
                                _this.receivedTiles(message);
                                break;

                        case "config":
                                _this.updateConfig(message);
                                _this.log.debug("[DEBUG] Received config message: ", message);
                                break;
                }
        };

        /**
         * When error occurred
         * @param event - event.data - contains data
         */
        this.wsocket.onerror = function (event)
        {
                var message = event.data;
                _this.log.error("[ERROR] -- WebSocket fatal error:  ", message)
        };

        /**
         * When WebSocket connection is closed
         */
        this.wsocket.onclose = function ()
        {
                _this.log.info("[INFO] WebSocket closed connection.");
                window.icfg.status = 0;
                window.stat.updateConnectionStatus(0);
        };

        /**
         * When config message arrives
         * @param message
         */
        this.updateConfig = function (message)
        {

                if(!window.config)
                {
                        window.config = {};
                }

                if(message.x_axis)
                {
                        window.config.x_axis = message.x_axis;
                }

                if(message.y_axis)
                {
                        window.config.y_axis = message.y_axis;
                }

                if(message.levels)
                {
                        window.config.levels = message.levels;
                }

                if(message.tile_size)
                {
                        window.config.tile_size = message.tile_size;
                }

                if(message.size)
                {
                        window.config.size = message.size;
                }

                if(message.channels)
                {
                        window.config.channels = message.channels;
                }

                if(!window.config.active_window_size)
                {
                        window.config.active_window_size = 50;
                }


                window.icfg.domain.x = window.config.x_axis;
                window.icfg.domain.y = window.config.y_axis;

                _this.log.info("[INFO] Updated config: " + window.config);
        };

        /**
         * Function to request tile from server
         * @param level - Level on which tile is
         * @param index - Index of tile
         */
        this.getTile = function (level, index)
        {
                _this.log.info("[DEBUG] Calling get tile for [%d, %d]", level, index);
                var message =
                {
                        type : "get",
                        level: level,
                        index: index
                };

                this.wsocket.send(JSON.stringify(message));
        };

        /**
         * Get tiles interval
         * @param level
         * @param beg - Begin interval
         * @param end - End interval
         */
        this.getTiles = function (level, beg, end)
        {
                this.log.info("[DEBUG] Calling get tiles @ level [%d] and interval [%d, %d]",
                              level, beg, end);
                var message =
                {
                        type : "get-tiles",
                        level: level,
                        beg  : beg,
                        end  : end
                };

                this.wsocket.send(JSON.stringify(message));
        };
}




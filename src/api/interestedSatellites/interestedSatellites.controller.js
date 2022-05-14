/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

const { Router } = require('express');
const StringHandler = require('../../lib/string-handler');
const wrapper = require('../../lib/request-handler');
const InterestedSatellitesService = require('./interestedSatellites.service');
const {
  UnauthorizedException,
  BadRequestException,
} = require('../../common/exceptions');

class InterestedSatellitesController {
  /** @param { InterestedSatellitesService } interestedSatellitesService */
  constructor(interestedSatellitesService) {
    this.interestedSatellitesService = interestedSatellitesService;
    this.path = '/interested-satellites';
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router
      .get('/', wrapper(this.readInterestedSatellites.bind(this)))
      .get('/conjunctions', wrapper(this.readInterestedConjunctions.bind(this)))
      .get('/find/:option', wrapper(this.findInterestedSatellites.bind(this)))
      .post('/:id', wrapper(this.addToInterestedSatellites.bind(this)))
      .delete('/:id', wrapper(this.removeFromInterestedSatellites.bind(this)));
  }

  async readInterestedSatellites(req, _res) {
    if (req.user) {
      const { email } = req.user;
      const readInterestedSatellites =
        await this.interestedSatellitesService.readInterestedSatellites(email);
      return {
        data: readInterestedSatellites,
      };
    }
    throw new UnauthorizedException();
  }

  async findInterestedSatellites(req, _res) {
    const { option } = req.params;
    if (req.user && option) {
      const { email } = req.user;
      const searchedSatellites = await (StringHandler.isNumeric(option)
        ? this.interestedSatellitesService.findSatellitesByIdService(
            email,
            option
          )
        : this.interestedSatellitesService.findSatellitesByNameService(
            email,
            option
          ));
      return {
        data: searchedSatellites,
      };
    }
    throw new UnauthorizedException();
  }

  async readInterestedConjunctions(req, _res) {
    if (req.user) {
      let {
        limit = 10,
        page = 0,
        sort = 'tcaTime',
        dec = '',
        satellite,
      } = req.query;

      if (page < 0) {
        page = 0;
      }
      if (limit <= 0) {
        limit = 10;
      }
      if (sort !== 'tcaTime' && sort !== 'dca' && sort !== 'probability') {
        sort = 'tcaTime';
      }
      if (dec !== '-') {
        dec = '';
      }
      sort = `${dec}${sort}`;
      if (satellite) {
        satellite = satellite.toUpperCase();
      }

      const { email } = req.user;
      if (satellite) {
        const { conjunctions, totalcount } = await (StringHandler.isNumeric(
          satellite
        )
          ? this.interestedSatellitesService.readInterestedConjunctions(
              email,
              limit,
              page,
              sort,
              satellite
            )
          : this.interestedSatellitesService.readInterestedConjunctions(
              limit,
              page,
              sort,
              satellite
            ));
        return {
          data: {
            totalcount,
            conjunctions,
          },
        };

        // const { email } = req.user;
        // const queryResult =
        //   await this.interestedSatellitesService.readInterestedConjunctions(
        //     email
        //   );
        // return { data: queryResult };
      }
      const { conjunctions, totalcount } =
        await this.interestedSatellitesService.readInterestedConjunctions(
          email,
          limit,
          page,
          sort
        );
      return {
        data: {
          totalcount,
          conjunctions,
        },
      };
    }
    throw new UnauthorizedException();
  }

  async addToInterestedSatellites(req, _res) {
    if (StringHandler.isNumeric(req.params.id)) {
      if (req.user) {
        const { email } = req.user;
        const queryResult =
          await this.interestedSatellitesService.createOrUpdateInterestedSatelliteId(
            email,
            req.params.id
          );
        return {
          data: queryResult,
        };
      }
    } else {
      throw new BadRequestException();
    }
    throw new UnauthorizedException();
  }

  async removeFromInterestedSatellites(req, _res) {
    if (StringHandler.isNumeric(req.params.id)) {
      if (req.user) {
        const { email } = req.user;
        const queryResult =
          await this.interestedSatellitesService.deleteInterestedSatelliteId(
            email,
            req.params.id
          );
        return {
          data: queryResult,
        };
      }
    } else {
      throw new BadRequestException();
    }
    throw new UnauthorizedException();
  }
}

module.exports = InterestedSatellitesController;

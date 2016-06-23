# -*- coding: utf-8 -*-

import os

import pytest
from webtest import TestApp

TEST_SETTINGS = {
    'es.host': os.environ.get('ELASTICSEARCH_HOST', 'http://localhost:9200'),
    'es.index': 'hypothesis-test',
    'legacy.es.index': 'annotator-test',
    'h.db.should_create_all': True,
    'h.db.should_drop_all': True,
    'h.search.autoconfig': True,
    'sqlalchemy.url': os.environ.get('TEST_DATABASE_URL',
                                     'postgresql://postgres@localhost/htest')
}


@pytest.fixture
def config():
    from h.config import configure

    config = configure()
    config.registry.settings.update(TEST_SETTINGS)
    _drop_indices(settings=config.registry.settings)
    config.include('h.app')
    config.include('h.session')
    return config


@pytest.fixture
def app(config):
    return TestApp(config.make_wsgi_app())


@pytest.yield_fixture
def db_session(request, config):
    """Get a standalone database session for preparing database state."""
    from h import db
    engine = db.make_engine(config.registry.settings)
    session = db.Session(bind=engine)
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


def _drop_indices(settings):
    import elasticsearch

    conn = elasticsearch.Elasticsearch([settings['es.host']])

    for name in [settings['es.index'], settings['legacy.es.index']]:
        if conn.indices.exists(index=name):
            conn.indices.delete(index=name)
